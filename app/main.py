# app/main.py (最終修正版 - エラー解消済み)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv
import google.generativeai as genai
import json
import logging
from fastapi.middleware.cors import CORSMiddleware
import datetime
from typing import Optional, List

# --- 基本設定 ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
load_dotenv()

# --- FastAPIアプリとCORSの設定 ---
app = FastAPI(
    title="AI Navigator (AIN) Backend",
    description="ユーザーの要件に基づいて最適なAI構成と、対話的に修正可能な本格的な企画書を提案するAPIです。",
    version="9.0.0"
)

# Renderデプロイのため、一旦すべて許可します。本番環境ではフロントエンドのURLに限定してください。
origins = ["*"] 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Gemini APIの設定 ---
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("環境変数 'GEMINI_API_KEY' が設定されていません。")
    genai.configure(api_key=api_key)
except Exception as e:
    logging.critical(f"Gemini APIキーの設定に失敗しました: {e}")
    raise RuntimeError("Gemini APIキーが設定されていないため、アプリケーションを起動できません。")

# --- Pydanticモデル定義 (ReactのUserPayloadに完全に一致させる) ---
class UserPayload(BaseModel):
    purpose: str
    project_type: str = Field(..., alias='projectType')
    budget: int
    experience_level: str = Field(..., alias='experienceLevel')
    weekly_hours: str = Field(..., alias='weeklyHours')
    development_time: Optional[int] = Field(None, alias='developmentTime')
    language: Optional[str] = "ja"

    class Config:
        populate_by_name = True
        extra = 'ignore' # Reactから余分なフィールドが来ても無視する

# FullProposalRequest: initial_suggestion を含む
class FullProposalRequest(UserPayload): # UserPayloadを継承
    initial_suggestion: str = Field(..., alias='initialSuggestion')

# RefinementRequest (ReactのRefinementRequestに完全に一致させる)
class RefinementRequest(BaseModel):
    user_payload: UserPayload = Field(..., alias='userPayload')
    current_proposal: str = Field(..., alias='currentProposal')
    refinement_request: str = Field(..., alias='refinementRequest')

    class Config:
        populate_by_name = True

# RefinementResponse (FastAPIからフロントエンドに返すJSONの型)
class RefinementResponse(BaseModel):
    type: str  # 'proposal', 'answer', 'rejection' のいずれか
    content: str

# CustomPromptRequest (新しいエンドポイント用)
class CustomPromptRequest(BaseModel):
    prompt: str
    language: Optional[str] = "en"


# --- 知識ベース読み込み (起動時に一度だけ実行) ---
KNOWLEDGE_BASE_STR = ""
try:
    all_knowledge_data = []
    directory_path = "data"
    if os.path.isdir(directory_path):
        json_files = sorted([f for f in os.listdir(directory_path) if f.endswith('.json')])
        for filename in json_files:
            file_path = os.path.join(directory_path, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        all_knowledge_data.extend(data)
                    else: # 単一のJSONオブジェクトの場合も対応
                        all_knowledge_data.append(data)
                logging.info(f"知識ベースファイル '{filename}' を読み込みました。")
            except Exception as e:
                logging.error(f"エラー: {filename} の読み込み中にエラー: {e}")
    else:
        logging.warning(f"警告: 指定された知識ベースのパス '{directory_path}' はディレクトリではありません。")
        
    if not all_knowledge_data:
        logging.warning(f"警告: '{directory_path}' ディレクトリにJSONファイルが見つからないか、データが空です。")
        
    KNOWLEDGE_BASE_STR = json.dumps(all_knowledge_data, ensure_ascii=False)
    logging.info(f"合計 {len(all_knowledge_data)} 件の知識ベースエントリを起動時に読み込みました。")
except Exception as e:
    logging.critical(f"起動時の知識ベース読み込み処理全体でエラー: {e}")
    KNOWLEDGE_BASE_STR = "[]" # エラー時は空のJSON文字列


# --- プロンプト生成関数 ---

def generate_initial_prompt(user_input: UserPayload) -> str:
    language_instruction = "Please respond in English." if user_input.language == "en" else "日本語で回答してください。"
    
    return f"""
# 役割: あなたは、世界トップクラスのソリューションアーキテクトです。ユーザーの要件から最適な技術スタックを提案します。
# 現在の日付: {datetime.date.today().strftime("%Y年%m月%d日")}
# 知識ベース: ```json
{KNOWLEDGE_BASE_STR}
```
# ユーザー要件:
- **目的**: {user_input.purpose}
- **プロジェクト種類**: {user_input.project_type}
- **月額予算**: {user_input.budget}円 以下
- **開発経験**: {user_input.experience_level}
- **週の開発時間**: {user_input.weekly_hours}
- **開発期間**: {user_input.development_time or '未指定'}ヶ月 (ユーザー入力があれば考慮)
- **言語設定**: {user_input.language}

{language_instruction}

# 指示: 上記に基づき、最適な技術スタック構成案を提案してください。AIモデルだけでなく、フレームワーク、DB等のAI以外のツールも網羅的に考慮し、なぜそれを選んだのか理由を明確に記述してください。

# 提案フォーマット (Markdown)
---
### **ご提案する技術スタック**
**1. 構成概要と選定思想**
**2. フロントエンド**
- **推奨ツール**:
- **選定理由**:
**3. バックエンド**
- **推奨ツール**:
- **選定理由**:
**4. データベース**
- **推奨ツール**:
- **選定理由**:
**5. 主要なAIモデル / API**
- **推奨モデル**:
- **選定理由**:
**6. CI/CDとホスティング**
- **推奨ツール**:
- **選定理由**:
**7. 監視・分析**
- **推奨ツール**:
- **選定理由**:
**8. 開発と運用のための推奨ステップ**
(プロジェクトを始めるための具体的な初期ステップを5〜7個程度記述)
"""

def generate_prompt_creation_prompt(user_input: UserPayload) -> str:
    """Generate a prompt that creates an AI prompt based on user requirements"""
    language_instruction = "Please respond in English." if user_input.language == "en" else "日本語で回答してください。"
    
    return f"""
# 役割: あなたは、プロンプトエンジニアリングの専門家です。ユーザーの要件から、AIシステムに送信するための最適化されたプロンプトを生成します。

# 現在の日付: {datetime.date.today().strftime("%Y年%m月%d日")}

# ユーザー要件:
- **目的**: {user_input.purpose}
- **プロジェクト種類**: {user_input.project_type}
- **月額予算**: {user_input.budget}円 以下
- **開発経験**: {user_input.experience_level}
- **週の開発時間**: {user_input.weekly_hours}
- **開発期間**: {user_input.development_time or '未指定'}ヶ月
- **言語設定**: {user_input.language}

{language_instruction}

# 指示: 上記のユーザー要件を基に、AIシステムに送信するための包括的で効果的なプロンプトを生成してください。

生成するプロンプトには以下の要素を含めてください：
1. 明確なプロジェクトコンテキストと目標
2. 技術的要件と制約
3. 予算とタイムラインの考慮事項
4. 経験レベルに応じた推奨事項の要求
5. 具体的な技術スタック推奨の依頼
6. 実装ステップとベストプラクティスの要求

生成されたプロンプトは、そのままAIシステムに送信して包括的な技術スタック推奨を得られるように構成してください。

# 出力フォーマット:
生成されたプロンプトのみを出力してください（説明文は不要）。
"""

def generate_full_proposal_prompt(request: FullProposalRequest) -> str:
    language_instruction = "Please respond in English." if request.language == "en" else "日本語で回答してください。"
    
    return f"""
# 役割: あなたは、経験豊富なシニアプロジェクトマネージャー兼AIコンサルタントです。
# 現在の日付: {datetime.date.today().strftime("%Y年%m月%d日")}
# ユーザー要件:
- 目的: {request.purpose}
- 予算: {request.budget}円/月 以下
- 経験: {request.experience_level}
- 時間: {request.weekly_hours}/週
- プロジェクト種類: {request.project_type}
- 開発期間: {request.development_time or '未指定'}ヶ月 (ユーザー入力があれば考慮)
- 言語設定: {request.language}

{language_instruction}

# 知識ベース: ```json
{KNOWLEDGE_BASE_STR}
```
# 初期提案 (AINによる技術スタック提案):
{request.initial_suggestion}

# 指示:
上記情報を基に、投資家や経営層にも提出できる、最高品質のプロジェクト企画書を作成してください。
以下のフォーマットと項目を**すべて**含め、具体的かつ論理的に記述してください。
特に「6. 開発フェーズ別具体的なタスクリスト」は、ユーザーが次に行うべきアクションを明確に理解できるよう、極めて詳細に記述してください。

# 企画書フォーマット (Markdown)
---
### **プロジェクト名案**
- 案1: (キャッチーで覚えやすい名前)
- 案2: (プロジェクト内容を的確に表す名前)
- 案3: (先進性を感じさせる名前)
### **1. 目的と背景**
(ユーザーの「実現したいこと」をより詳細に、その背景にある課題と機会を記述)
### **2. ターゲットユーザーと課題**
### **3. ソリューション概要**
(AINが提案した技術スタックと、それがどのようにユーザーの課題を解決するかを具体的な機能として記述)
### **4. 技術スタック**
(主要なAIモデル/API、フレームワーク、DB、クラウド、CI/CD、監視など、AINが提案した具体的なツールとその選定理由を簡潔にまとめる)
### **5. 開発ロードマップと期間**
(プロジェクト全体をフェーズ分けし、各フェーズの目標、主要な成果物、期間の目安を記述。ユーザーの「週に使える開発時間」と「開発経験レベル」を考慮した現実的な期間を設定。)
### **6. 開発フェーズ別具体的なタスクリスト**
(【最重要】「フェーズ1: 環境構築と基盤作成」「フェーズ2: コア機能実装」「フェーズ3: UI/UX改善とデプロイ」のようにフェーズ分けし、各タスクに[期間目安][スキルレベル][関連ツール]を付記し、「**💡このタスクで行き詰まったら、AINに『[タスク名]についてもっと詳しく教えて』と聞いてみてください。**」という次の対話への誘導を必ず含めること)
### **7. 開発体制**
(推奨されるチーム構成と役割、あるいは個人で進める場合の推奨事項を記述)
### **8. リスク分析と対策**
(技術的リスク、運用リスク、スケジュールリスクなどを挙げ、それぞれの対策を記述)
### **9. 費用概算とROI（投資対効果）予測**
(提案された技術スタックに基づく月額費用概算を具体的に記述。ROI予測は、費用対効果やビジネスインパクトを簡潔に予測。ユーザーの予算制約を考慮し、無料枠での可能性や、予算超過時の注意点を明記。)
### **10. 競合分析と差別化**
(類似の既存サービスや代替アプローチを挙げ、本プロジェクトの独自性や優位性を記述)
### **11. 類似プロジェクト事例**
(あなたの知識を基に、ユーザーの目的に近い実在のオープンソースプロジェクトや有名サービスの事例を2〜3個提示し、参考にできる点や、本プロジェクトとの違いを記述)
### **12. 最新AIトレンドのハイライト**
(このプロジェクトに関連する最先端のAI技術や研究動向（例：リアルタイム音声対話、エージェント技術、マルチモーダルLLMの活用事例など）を簡潔に紹介し、本プロジェクトの先進性をアピール。具体的な技術名も記述。)
### **13. 成功指標 (KPI)**
### **14. 今後の展望**
(将来的な機能拡張、ビジネスモデル（フリーミアム、サブスクなど）、チーム開発支援、自動情報収集など、長期的なビジョンを記述)
### **15. 3段階のスケーリング案**
- **最小構成 (MVP)**:
- **標準構成**:
- **理想構成**:
"""

def generate_refine_prompt(request: RefinementRequest) -> str:
    language_instruction = "Please respond in English." if request.user_payload.language == "en" else "日本語で回答してください。"
    
    return f"""
# 役割:
あなたは「AIアドバイザー」です。ユーザーからの指示を分析し、以下のルールに従って応答を生成してください。

{language_instruction}

# ルール:
1.  まず、ユーザーの指示が「現在の企画書」に直接関連する「修正依頼」か「質問」かを判断します。
2.  **修正依頼の場合**: 企画書を指示通りに修正し、修正後の企画書全体を生成します。応答タイプは "proposal" とします。
3.  **質問の場合**: 企画書は変更せず、その質問に対する回答のみを生成します。応答タイプは "answer" とします。
4.  **企画書に関係ない場合**: 「申し訳ありませんが、そのご質問にはお答えできません。企画書に関する内容でお願いします。」という固定の文章を生成します。応答タイプは "rejection" とします。
5.  生成するテキストの最後に、`(AINからのアドバイス：無料版でのご相談はあと数回可能です。より専門的なコンサルティングや無制限の修正はProプランをご検討ください。)` というメッセージを**含めないでください**。

# 出力フォーマット (JSON):
必ず以下のJSON形式で応答してください。
{{
  "type": "proposal" | "answer" | "rejection",
  "content": "ここに生成したテキスト（企画書全体、回答、または拒否メッセージ）を入れる"
}}

---
# 入力情報

## 現在の企画書:
```markdown
{request.current_proposal}
```

## ユーザーの初期要件:
```json
{json.dumps(request.user_payload.model_dump(by_alias=True), ensure_ascii=False, indent=2)}
```

## ユーザーからの今回の指示:
「{request.refinement_request}」

---
# あなたの応答 (JSON形式で):
"""

# --- ユーティリティ: 知識ベースを返す関数 ---
def load_knowledge_base():
    return KNOWLEDGE_BASE_STR

# --- APIエンドポイント ---
@app.post("/analyze_purpose/")
async def analyze_purpose(request: UserPayload):
    try:
        if KNOWLEDGE_BASE_STR == "[]":
            logging.error("知識ベースが空です。data/ディレクトリのJSONファイルを確認してください。")
            raise HTTPException(status_code=500, detail="提案の生成中にエラー: 知識ベースが空です。")
            
        prompt = generate_initial_prompt(request)
        model = genai.GenerativeModel('gemini-1.5-flash-latest') 
        
        logging.info(f"Geminiに初期提案リクエストを送信します... (モデル: {model.model_name})")
        response = await model.generate_content_async(prompt)
        
        logging.info("Geminiから初期提案応答を受信しました。")
        return {"suggestion": response.text}
        
    except Exception as e:
        logging.exception("初期提案の生成中にエラーが発生しました")
        raise HTTPException(status_code=500, detail=f"初期提案の生成中にエラーが発生しました: {str(e)}")

@app.post("/generate_prompt/")
async def generate_prompt(request: UserPayload):
    """Generate an AI prompt based on user requirements"""
    try:
        if KNOWLEDGE_BASE_STR == "[]":
            logging.error("知識ベースが空です。data/ディレクトリのJSONファイルを確認してください。")
            raise HTTPException(status_code=500, detail="プロンプト生成中にエラー: 知識ベースが空です。")
            
        prompt = generate_prompt_creation_prompt(request)
        model = genai.GenerativeModel('gemini-1.5-flash-latest') 
        
        logging.info(f"Geminiにプロンプト生成リクエストを送信します... (モデル: {model.model_name})")
        response = await model.generate_content_async(prompt)
        
        logging.info("Geminiからプロンプト生成応答を受信しました。")
        return {"suggestion": response.text}
        
    except Exception as e:
        logging.exception("プロンプト生成中にエラーが発生しました")
        raise HTTPException(status_code=500, detail=f"プロンプト生成中にエラーが発生しました: {str(e)}")

@app.post("/generate_full_proposal/")
async def generate_full_proposal(request: FullProposalRequest):
    try:
        if KNOWLEDGE_BASE_STR == "[]":
            logging.error("知識ベースが空です。data/ディレクトリのJSONファイルを確認してください。")
            raise HTTPException(status_code=500, detail="企画書生成中にエラー: 知識ベースが空です。")
            
        prompt = generate_full_proposal_prompt(request)
        model = genai.GenerativeModel('gemini-1.5-pro-latest') 
        
        logging.info(f"Geminiに企画書生成リクエストを送信します... (モデル: {model.model_name})")
        response = await model.generate_content_async(prompt, request_options={"timeout": 600})
        
        logging.info("Geminiから企画書生成応答を受信しました。")
        return {"suggestion": response.text}
    except Exception as e:
        logging.exception("企画書生成中にエラーが発生しました")
        raise HTTPException(status_code=500, detail=f"企画書生成中にエラーが発生しました: {str(e)}")

@app.post("/refine_proposal/", response_model=RefinementResponse)
async def refine_proposal_endpoint(request: RefinementRequest):
    response_text_for_logging = ""
    try:
        if KNOWLEDGE_BASE_STR == "[]":
            logging.error("知識ベースが空です。data/ディレクトリのJSONファイルを確認してください。")
            raise HTTPException(status_code=500, detail="企画書修正中にエラー: 知識ベースが空です。")
            
        prompt = generate_refine_prompt(request)
        model = genai.GenerativeModel('gemini-1.5-pro-latest') 
        
        logging.info(f"Geminiに修正/質問リクエストを送信します... (モデル: {model.model_name})")
        response = await model.generate_content_async(
            prompt, 
            generation_config=genai.types.GenerationConfig(response_mime_type="application/json")
        )
        
        response_text_for_logging = response.text
        response_json = json.loads(response_text_for_logging)

        return RefinementResponse(
            type=response_json.get("type", "answer"),
            content=response_json.get("content", "エラー：応答を解析できませんでした。")
        )

    except json.JSONDecodeError as e:
        logging.error(f"/refine_proposal/ JSONパースエラー: {e} - Geminiからの応答: {response_text_for_logging}")
        return RefinementResponse(
            type="answer",
            content=f"大変申し訳ありません、AIからの応答形式に問題があり解析できませんでした。少し時間を置いてから再度お試しください。"
        )
    except Exception as e:
        logging.exception("企画書修正/質問応答中にエラーが発生しました")
        return RefinementResponse(
            type="answer",
            content=f"大変申し訳ありません、リクエストの処理中に予期せぬエラーが発生しました。({type(e).__name__})"
        )

@app.post("/execute_custom_prompt/")
async def execute_custom_prompt(request: CustomPromptRequest):
    try:
        language_instruction = "Please respond in English." if request.language == "en" else "日本語で回答してください。"
        
        enhanced_prompt = f"""
{language_instruction}

# Knowledge Base: ```json
{KNOWLEDGE_BASE_STR}
```

# User's Custom Prompt:
{request.prompt}

Please provide a comprehensive and helpful response based on the user's request and the available knowledge base.
"""
        
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = await model.generate_content_async(enhanced_prompt)
        return {"suggestion": response.text}
    except Exception as e:
        logging.error(f"/execute_custom_prompt/ エラー: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "AI Navigator (AIN) Backend v9.0 is running with enhanced features."}