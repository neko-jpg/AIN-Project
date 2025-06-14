# このファイルは app/main.py です

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import google.generativeai as genai
import json
import logging
from fastapi.middleware.cors import CORSMiddleware
import datetime
from typing import Dict, Any, List

# --- 基本設定 ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
load_dotenv()

# --- FastAPIアプリとCORSの設定 ---
app = FastAPI(
    title="AI Navigator (AIN) Backend",
    description="ユーザーの要件に基づいて最適なAI構成と、対話的に修正可能な本格的な企画書を提案するAPIです。",
    version="6.0.0"
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
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEYが設定されていません。'.env'ファイルを確認してください。")
genai.configure(api_key=GEMINI_API_KEY)

# --- ★★★ PydanticモデルをReactの型定義(api.ts)に完全に一致させる ★★★ ---
class UserPayload(BaseModel):
    purpose: str
    project_type: str
    budget: int
    experience_level: str
    weekly_hours: str

class FullProposalRequest(UserPayload):
    # このモデルは現在フロントエンドからは直接使われませんが、
    # 将来的に初期提案を渡すように拡張する場合のために残しておきます。
    initial_suggestion: str
    
class RefineRequest(BaseModel):
    # ReactのApp.tsxから送られてくるキー名に合わせる
    user_payload: UserPayload
    current_proposal: str
    refinement_request: str

# --- 複数JSONファイル対応の知識ベース読み込み関数 ---
def load_knowledge_base(directory_path: str = "data") -> str:
    all_knowledge = []
    try:
        if not os.path.isdir(directory_path):
            logging.error(f"エラー: 指定された知識ベースのパス '{directory_path}' はディレクトリではありません。")
            return "[]"
        json_files = sorted([f for f in os.listdir(directory_path) if f.endswith('.json')])
        if not json_files:
            logging.warning(f"警告: '{directory_path}' ディレクトリにJSONファイルが見つかりません。")
            return "[]"
        
        logging.info(f"'{directory_path}' ディレクトリから以下のファイルを読み込みます: {json_files}")

        for filename in json_files:
            file_path = os.path.join(directory_path, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        all_knowledge.extend(data)
            except Exception as e:
                logging.error(f"エラー: {filename} の読み込み中にエラー: {e}")
        
        logging.info(f"合計 {len(all_knowledge)} 件の知識ベースエントリを読み込みました。")
        return json.dumps(all_knowledge, indent=2, ensure_ascii=False)

    except Exception as e:
        logging.error(f"知識ベース読み込み処理全体でエラー: {e}")
        return "[]"

# --- プロンプト生成関数群 ---

def generate_initial_prompt(user_input: UserPayload, knowledge_base: str) -> str:
    return f"""
# 役割: あなたは、世界トップクラスのソリューションアーキテクトです。ユーザーの要件から最適な技術スタックを提案します。
# 知識ベース: ```json\n{knowledge_base}\n```
# ユーザー要件:
- **目的**: {user_input.purpose}
- **プロジェクト種類**: {user_input.project_type}
- **月額予算**: {user_input.budget}円 以下
- **開発経験**: {user_input.experience_level}
- **週の開発時間**: {user_input.weekly_hours}
# 指示: 上記に基づき、最適な技術スタック構成案を提案してください。各技術要素（フロントエンド、バックエンド、DB、AI、CI/CD、監視等）について、なぜそれを選んだのか理由を明確に記述してください。

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

def generate_full_proposal_prompt(request: UserPayload, knowledge_base: str) -> str: # FullProposalRequest -> UserPayload
    return f"""
# 役割: あなたは、経験豊富なシニアプロジェクトマネージャー兼AIコンサルタントです。
# ユーザー要件:
- 目的: {request.purpose}
- 予算: {request.budget}円/月 以下
- 経験: {request.experience_level}
- 時間: {request.weekly_hours}/週
- プロジェクト種類: {request.project_type}
# 知識ベース: ```json\n{knowledge_base}\n```
# 指示:
上記情報を基に、投資家や経営層にも提出できる、最高品質のプロジェクト企画書を作成してください。
以下のフォーマットと項目を**すべて**含め、具体的かつ論理的に記述してください。
特に「6. 開発フェーズ別具体的なタスクリスト」は、ユーザーが次に行うべきアクションを明確に理解できるよう、極めて詳細に記述してください。

# 企画書フォーマット (Markdown)
---
### **プロジェクト名案**
- 案1:
- 案2:
- 案3:
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

def generate_refine_prompt(request: RefineRequest) -> str:
    return f"""
# 役割: あなたは「AIの消しゴム」機能を持つ、超優秀な「AIアドバイザー」です。
# 元の企画書: ```markdown\n{request.current_proposal}\n```
# ユーザーからの修正・質問指示: "{request.refinement_request}"
# ユーザーの初期要件: {json.dumps(request.user_payload.model_dump())}
# 指示:
ユーザーの指示を正確に解釈し、以下のいずれかの役割を完璧に遂行してください。
1.  **AI消しゴム (修正依頼の場合)**: ユーザーの指示が修正依頼である場合、元の企画書から指定された部分だけを的確に修正し、**企画書全体を整合性を保ちながら再構成して出力**してください。元のフォーマットは完全に維持し、自然な企画書を返却してください。
2.  **AIアドバイザー (質問の場合)**: ユーザーの指示が深掘りの質問である場合、**企画書は変更せず、その質問に対する回答のみを**、専門家として詳細かつ分かりやすく記述してください。
3.  **利用制限の示唆**: どちらの場合でも、回答の最後に、`(AINからのアドバイス：無料版でのご相談はあと数回可能です。より専門的なコンサルティングや無制限の修正はProプランをご検討ください。)`というメッセージを必ず付け加えてください。
"""

# --- APIエンドポイント ---
@app.post("/analyze_purpose/")
async def analyze_purpose(request: UserPayload):
    try:
        knowledge_base_str = load_knowledge_base()
        prompt = generate_initial_prompt(request, knowledge_base_str)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt, request_options={"timeout": 600})
        return {"suggestion": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_full_proposal/")
async def generate_full_proposal(request: UserPayload): # FullProposalRequest -> UserPayload
    try:
        knowledge_base_str = load_knowledge_base()
        prompt = generate_full_proposal_prompt(request, knowledge_base_str)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt, request_options={"timeout": 600})
        # ★ フロントエンドの期待するキー 'suggestion' に合わせて返す
        return {"suggestion": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/refine_proposal/")
async def refine_proposal(request: RefineRequest):
    try:
        prompt = generate_refine_prompt(request)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt, request_options={"timeout": 600})
        # ★ フロントエンドの期待するキー 'suggestion' に合わせて返す
        return {"suggestion": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "AI Navigator (AIN) Backend v6.0 is running."}
