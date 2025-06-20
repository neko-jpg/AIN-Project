# app/main.py (Enhanced with custom prompt execution)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import google.generativeai as genai
import json
import logging
from fastapi.middleware.cors import CORSMiddleware
import datetime
from typing import Dict, Any, List, Optional

# --- 基本設定 ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
load_dotenv()

# --- FastAPIアプリとCORSの設定 ---
app = FastAPI(
    title="AI Navigator (AIN) Backend",
    description="ユーザーの要件に基づいて最適なAI構成と、対話的に修正可能な本格的な企画書を提案するAPIです。",
    version="9.0.0"
)

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

# --- Pydanticモデル ---
class UserPayload(BaseModel):
    purpose: str
    project_type: str
    budget: int
    experience_level: str
    weekly_hours: str
    development_time: Optional[int] = None
    language: Optional[str] = "ja"

class RefinementRequest(BaseModel):
    user_payload: UserPayload
    current_proposal: str
    refinement_request: str

class RefinementResponse(BaseModel):
    type: str
    content: str

class CustomPromptRequest(BaseModel):
    prompt: str
    language: Optional[str] = "en"

# --- 知識ベース読み込み ---
KNOWLEDGE_BASE_STR = ""
try:
    all_knowledge_data = []
    directory_path = "data"
    if os.path.isdir(directory_path):
        json_files = sorted([f for f in os.listdir(directory_path) if f.endswith('.json')])
        for filename in json_files:
            file_path = os.path.join(directory_path, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                all_knowledge_data.extend(json.load(f))
    KNOWLEDGE_BASE_STR = json.dumps(all_knowledge_data, ensure_ascii=False)
    logging.info(f"合計 {len(all_knowledge_data)} 件の知識ベースエントリを起動時に読み込みました。")
except Exception as e:
    logging.error(f"起動時の知識ベース読み込み処理全体でエラー: {e}")

# --- プロンプト生成関数 ---

def generate_initial_prompt(user_input: UserPayload) -> str:
    language_instruction = "Please respond in English." if user_input.language == "en" else "日本語で回答してください。"
    
    return f"""
# 役割: あなたは、世界トップクラスのソリューションアーキテクトです。ユーザーの要件から最適な技術スタックを提案します。
# 知識ベース: ```json
{KNOWLEDGE_BASE_STR}
```
# ユーザー要件:
- **目的**: {user_input.purpose}
- **プロジェクト種類**: {user_input.project_type}
- **月額予算**: {user_input.budget}円 以下
- **開発経験**: {user_input.experience_level}
- **週の開発時間**: {user_input.weekly_hours}
- **開発期間**: {user_input.development_time or 6}ヶ月
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
"""

def generate_full_proposal_prompt(request: UserPayload) -> str:
    language_instruction = "Please respond in English." if request.language == "en" else "日本語で回答してください。"
    
    return f"""
# 役割: あなたは、経験豊富なシニアプロジェクトマネージャー兼AIコンサルタントです。
# ユーザー要件:
- 目的: {request.purpose}
- 予算: {request.budget}円/月 以下
- 経験: {request.experience_level}
- 時間: {request.weekly_hours}/週
- プロジェクト種類: {request.project_type}
- 開発期間: {request.development_time or 6}ヶ月
- 言語設定: {request.language}

{language_instruction}

# 知識ベース: ```json
{KNOWLEDGE_BASE_STR}
```
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
### **2. ターゲットユーザーと課題**
### **3. ソリューション概要**
### **4. 技術スタック**
### **5. 開発ロードマップと期間**
### **6. 開発フェーズ別具体的なタスクリスト**
(【最重要】「フェーズ1: 環境構築」「フェーズ2: コア機能実装」「フェーズ3: UI/UX改善とデプロイ」のようにフェーズ分けし、各タスクに[期間目安][スキルレベル][関連ツール]を付記し、「**💡このタスクで行き詰まったら、AINに『[タスク名]についてもっと詳しく教えて』と聞いてみてください。**」という次の対話への誘導を必ず含めること)
### **7. 開発体制**
### **8. リスク分析と対策**
### **9. 費用概算とROI（投資対効果）予測**
### **10. 競合分析と差別化**
### **11. 類似プロジェクト事例**
### **12. 最新AIトレンドのハイライト**
### **13. 成功指標 (KPI)**
### **14. 今後の展望**
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
5.  生成するテキストの最後に、`(AINからのアドバイス：...Proプランをご検討ください。)` というメッセージは**含めないでください**。

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
{json.dumps(request.user_payload.model_dump(), ensure_ascii=False)}
```

## ユーザーからの今回の指示:
「{request.refinement_request}」

---
# あなたの応答 (JSON形式で):
"""

# --- APIエンドポイント ---
@app.post("/analyze_purpose/")
async def analyze_purpose(request: UserPayload):
    try:
        prompt = generate_initial_prompt(request)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = await model.generate_content_async(prompt)
        return {"suggestion": response.text}
    except Exception as e:
        logging.error(f"/analyze_purpose/ エラー: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_full_proposal/")
async def generate_full_proposal(request: UserPayload):
    try:
        prompt = generate_full_proposal_prompt(request)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = await model.generate_content_async(prompt)
        return {"suggestion": response.text}
    except Exception as e:
        logging.error(f"/generate_full_proposal/ エラー: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/refine_proposal/", response_model=RefinementResponse)
async def refine_proposal_endpoint(request: RefinementRequest):
    try:
        prompt = generate_refine_prompt(request)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        generation_config = genai.types.GenerationConfig(
            response_mime_type="application/json"
        )
        
        response = await model.generate_content_async(prompt, generation_config=generation_config)
        
        response_json = json.loads(response.text)

        return RefinementResponse(
            type=response_json.get("type", "answer"),
            content=response_json.get("content", "エラー：応答を解析できませんでした。")
        )

    except Exception as e:
        logging.error(f"/refine_proposal/ エラー: {e}")
        return RefinementResponse(
            type="answer",
            content=f"大変申し訳ありません、リクエストの処理中にエラーが発生しました。({e})"
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