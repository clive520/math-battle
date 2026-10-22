import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
import os
import re

M_NS = "http://schemas.openxmlformats.org/officeDocument/2006/math"
W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

def set_font(run, font_name="標楷體", ascii_font="Times New Roman", size_pt=12, bold=False, italic=False, color=None):
    run.font.name = ascii_font
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    if color:
        run.font.color.rgb = color
    rPr = run._r.get_or_add_rPr()
    rFonts = OxmlElement('w:rFonts')
    rFonts.set(qn('w:ascii'), ascii_font)
    rFonts.set(qn('w:hAnsi'), ascii_font)
    rFonts.set(qn('w:eastAsia'), font_name)
    rPr.append(rFonts)

def make_omath(expr_str, size_pt=11.5, bold=False):
    sz_val = int(size_pt * 2)
    b_xml = "<w:b/>" if bold else ""
    rpr_xml = (
        f'<w:rPr>'
        f'<w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:eastAsia="標楷體"/>'
        f'{b_xml}'
        f'<w:sz w:val="{sz_val}"/><w:szCs w:val="{sz_val}"/>'
        f'</w:rPr>'
    )
    
    tokens = expr_str.strip().split(' ')
    inner_xml = ''
    for tok in tokens:
        if not tok:
            continue
        m_mixed = re.match(r'^(\d+)_(\d+)/(\d+)$', tok)
        m_frac = re.match(r'^(\d+)/(\d+)$', tok)
        if m_mixed:
            w_part, num, den = m_mixed.groups()
            inner_xml += (
                f'<m:r><m:rPr><m:sty m:val="p"/></m:rPr>{rpr_xml}<m:t>{w_part}</m:t></m:r>'
                f'<m:f><m:fPr><m:ctrlPr>{rpr_xml}</m:ctrlPr></m:fPr>'
                f'<m:num><m:r><m:rPr><m:sty m:val="p"/></m:rPr>{rpr_xml}<m:t>{num}</m:t></m:r></m:num>'
                f'<m:den><m:r><m:rPr><m:sty m:val="p"/></m:rPr>{rpr_xml}<m:t>{den}</m:t></m:r></m:den>'
                f'</m:f>'
            )
        elif m_frac:
            num, den = m_frac.groups()
            inner_xml += (
                f'<m:f><m:fPr><m:ctrlPr>{rpr_xml}</m:ctrlPr></m:fPr>'
                f'<m:num><m:r><m:rPr><m:sty m:val="p"/></m:rPr>{rpr_xml}<m:t>{num}</m:t></m:r></m:num>'
                f'<m:den><m:r><m:rPr><m:sty m:val="p"/></m:rPr>{rpr_xml}<m:t>{den}</m:t></m:r></m:den>'
                f'</m:f>'
            )
        else:
            text_val = tok
            if tok in ['÷', '=', '×', '+', '-', ':', '＞', '＜', '＝', '≈']:
                text_val = f' {tok} '
            sty = 'i' if re.match(r'^[A-Za-z]$', tok) else 'p'
            inner_xml += (
                f'<m:r><m:rPr><m:sty m:val="{sty}"/></m:rPr>{rpr_xml}'
                f'<m:t xml:space="preserve">{text_val}</m:t></m:r>'
            )
            
    omath_xml = f'<m:oMath xmlns:m="{M_NS}" xmlns:w="{W_NS}">{inner_xml}</m:oMath>'
    return parse_xml(omath_xml)

def add_rich_text(p, text, font_name="標楷體", ascii_font="Times New Roman", size_pt=11.5, bold=False, italic=False, color=None):
    """
    Parses text containing {{eq:...}} tokens and \n line breaks.
    Appends regular runs and native Word OMML equations in sequential order.
    """
    parts = re.split(r'(\{\{eq:[^}]+\}\})', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('{{eq:') and part.endswith('}}'):
            expr = part[5:-2]
            p._p.append(make_omath(expr, size_pt=size_pt, bold=bold))
        else:
            lines = part.split('\n')
            for idx, line in enumerate(lines):
                if idx > 0:
                    br_run = p.add_run()
                    br_run.add_break()
                if line:
                    run = p.add_run(line)
                    set_font(run, font_name=font_name, ascii_font=ascii_font, size_pt=size_pt, bold=bold, italic=italic, color=color)

def add_p(doc_or_cell, text="", font_name="標楷體", ascii_font="Times New Roman", size_pt=11.5, bold=False, italic=False, color=None, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=3, line_spacing=1.2):
    p = doc_or_cell.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    if text:
        add_rich_text(p, text, font_name=font_name, ascii_font=ascii_font, size_pt=size_pt, bold=bold, italic=italic, color=color)
    return p

def add_run(p, text, font_name="標楷體", ascii_font="Times New Roman", size_pt=11.5, bold=False, italic=False, color=None):
    add_rich_text(p, text, font_name=font_name, ascii_font=ascii_font, size_pt=size_pt, bold=bold, italic=italic, color=color)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_section_header(doc, text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    cell.width = Inches(6.8)
    set_cell_background(cell, "E2E8F0")
    set_cell_margins(cell, top=70, bottom=70, left=140, right=140)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    add_run(p, text, font_name="標楷體", size_pt=12, bold=True, color=RGBColor(15, 23, 42))
    add_p(doc, "", space_after=3)

def add_calc_space(doc, height_inches=1.15, answer_prefix="答："):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    cell.width = Inches(6.8)
    cell.height = Inches(height_inches)
    set_cell_background(cell, "FAFAFA")
    set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="dashed" w:sz="4" w:space="0" w:color="CBD5E1"/><w:left w:val="dashed" w:sz="4" w:space="0" w:color="CBD5E1"/><w:bottom w:val="dashed" w:sz="4" w:space="0" w:color="CBD5E1"/><w:right w:val="dashed" w:sz="4" w:space="0" w:color="CBD5E1"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    add_run(p, "【計算與直式記錄區】", font_name="標楷體", size_pt=9, color=RGBColor(148, 163, 184))
    
    add_p(doc, f"{answer_prefix}____________________________________", font_name="標楷體", size_pt=11, bold=True, align=WD_ALIGN_PARAGRAPH.RIGHT, space_before=2, space_after=6)

def generate_exam_docx(output_path, diagram_path):
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.6)
        s.bottom_margin = Inches(0.6)
        s.left_margin = Inches(0.75)
        s.right_margin = Inches(0.75)
        s.page_width = Inches(8.27)
        s.page_height = Inches(11.69)
        
    # Title Block
    add_p(doc, "臺中市鹿陽國民小學 115 學年度第一學期", font_name="標楷體", size_pt=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
    add_p(doc, "六年級數學領域期中定期評量試卷", font_name="標楷體", size_pt=16, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
    add_p(doc, "命題範圍：康軒版第 1 單元 ～ 第 5 單元　　考試時間：40 分鐘　　滿分：100 分", font_name="標楷體", size_pt=10.5, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6)
    
    # Student Info Box
    tbl_info = doc.add_table(rows=1, cols=1)
    tbl_info.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_info = tbl_info.cell(0, 0)
    cell_info.width = Inches(6.8)
    set_cell_background(cell_info, "F8F9FA")
    set_cell_margins(cell_info, top=70, bottom=70, left=120, right=120)
    p_info = cell_info.paragraphs[0]
    p_info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run(p_info, "六年 ______ 班　座號：______　姓名：________________　得分：____________　家長簽章：____________", font_name="標楷體", size_pt=10.5, bold=True)
    add_p(doc, "", space_after=4)
    
    # Story Callout
    tbl_story = doc.add_table(rows=1, cols=1)
    tbl_story.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_story = tbl_story.cell(0, 0)
    c_story.width = Inches(6.8)
    set_cell_background(c_story, "F1F5F9")
    set_cell_margins(c_story, top=100, bottom=100, left=150, right=150)
    p_st = c_story.paragraphs[0]
    add_run(p_st, "🌟 主題情境導讀：【綠動校園・創客永續——鹿陽國小60週年校慶園遊會】\n", font_name="標楷體", size_pt=10.5, bold=True, color=RGBColor(30, 64, 175))
    add_run(p_st, "鹿陽國小即將迎來 60 週年校慶！六年級各班自治籌備委員正緊鑼密鼓展開會場規劃、特色工坊手作、資材採購比價以及營運結算。請你發揮敏銳的數學素養與精準運算能力，協助各組同學解決籌備過程中遇到的各項挑戰！", font_name="標楷體", size_pt=10, color=RGBColor(51, 65, 85))
    add_p(doc, "", space_after=6)
    
    # Section 1 (Original wording preserved, fractions converted to native OMML)
    add_section_header(doc, "一、 觀念辨析選擇題（每題 2 分，共 10 分）")
    
    q1_choices = [
        "(　　) 1. 籌備會要挑選編號為「質數」的幸運攤位號碼。下列關於質數、合數與互質的敘述，哪一個是正確的？\n"
        "       ① 所有的偶數都是合數\n"
        "       ② 互質的兩個整數一定都是質數\n"
        "       ③ 最小的質數是 2，最小的合數是 4\n"
        "       ④ 兩個大於 1 的整數相乘，積一定是質數",
        
        "(　　) 2. 烘焙組計算分裝包數時列出算式「{{eq:A ÷ 3/4 = B}}」。若原本原料重量 A > 0，請問分裝後的包數 B 和原本重量 A 的大小關係為何？\n"
        "       ① B > A\n"
        "       ② B < A\n"
        "       ③ B = A\n"
        "       ④ 無法比較",
        
        "(　　) 3. 會場服務台紀錄兩位志工的年齡，今年組長 12 歲、指導老師 36 歲。請問 8 年後兩人年齡的關係，下列哪一項敘述是正確的？\n"
        "       ① 指導老師比組長大 32 歲\n"
        "       ② 指導老師的年齡依然是組長的 3 倍\n"
        "       ③ 兩人的年齡差距依然是 24 歲\n"
        "       ④ 兩人的年齡總和與今年相同",
        
        "(　　) 4. 宣傳組用直式計算橫幅印刷長度「15.6 ÷ 1.2」，將被除數與除數的小數點同時向右移動一位後進行計算。請問算出來的「商」，其小數點應如何對齊？\n"
        "       ① 必須對齊被除數原來的小數點\n"
        "       ② 必須對齊被除數移動後的新小數點\n"
        "       ③ 必須對齊除數移動後的小數點\n"
        "       ④ 只要點在最後面整數位置即可",
        
        "(　　) 5. 飲品工坊標示特調飲品配方為「檸檬汁對綠茶的容量比是 3 : 8」。下列關於這個比的敘述，哪一個是錯誤的？\n"
        "       ① 3 是比的前項，8 是比的後項\n"
        "       ② 這個比的比值是 {{eq:3/8}}\n"
        "       ③ 如果檸檬汁倒入 30 mL，綠茶就需要倒入 80 mL\n"
        "       ④ 檸檬汁的容量占整杯特調飲品的 {{eq:3/8}}"
    ]
    for q in q1_choices:
        add_p(doc, q, size_pt=11, space_after=5, line_spacing=1.2)
        
    add_p(doc, "", space_after=4)
    
    # Section 2 (Updated per user instructions: Q1(2) square frame, native OMML fractions, Q3 diagram)
    add_section_header(doc, "二、 展區規格填填看（每格 2 分，共 20 分）")
    
    # Q1
    add_p(doc,
        "1.【木工創客攤位的木條裁切與正方形邊框拼湊】\n"
        "   木工組有長度分別為 72 cm 與 90 cm 的兩種木條，準備用來製作展示架與邊框：\n"
        "   (1) 若拿一根 72 cm 和一根 90 cm 的木條，想將它們全部裁切成每段一樣長的小木段，且剛好切完沒有剩餘，裁切出來的小木段最長是（　　　　　）cm。\n"
        "   (2) 若改用許多根 72 cm 的木條連接拼湊成邊框的一邊，另一邊則用許多根 90 cm 的木條連接拼湊。如果要拼湊成一個「正方形的邊框」，這個正方形最短的邊長是（　　　　　）cm。",
        size_pt=11, space_after=6, line_spacing=1.25
    )
    
    # Q2
    add_p(doc,
        "2.【烘焙攤位的原料填充與分裝盒數比較】\n"
        "   烘焙組正在清點果露與奶油的分裝規格：\n"
        "   (1) 桌上有一瓶容量為 {{eq:4/5}} 公升的空玻璃瓶，組員將 {{eq:8/15}} 公升的濃縮百香果露全部倒進瓶中，請問果露占了這個玻璃瓶容量的（　　　　　）（答案請化為最簡分數）。\n"
        "   (2) 另有甲、乙兩桶各重 {{eq:4_1/2}} 公斤的奶油：甲桶每 {{eq:7/6}} 公斤裝成一盒，乙桶每 {{eq:6/7}} 公斤裝成一盒。不用計算，請比較兩桶裝出來的總盒數，在 □ 裡填入 ＞、＜ 或 ＝：\n"
        "       甲桶裝成的盒數 {{eq:4_1/2 ÷ 7/6}}　□　乙桶裝成的盒數 {{eq:4_1/2 ÷ 6/7}}",
        size_pt=11, space_after=6, line_spacing=1.3
    )
    
    # Q3 with Diagram
    add_p(doc,
        "3.【美食休息區的野餐方桌拼接規律】\n"
        "   場務組在休息區將「每張四邊各坐 1 人（單張可坐 4 人）」的正方形野餐桌，一張接一張緊密排成一長排（兩張桌子相接的邊不能坐人，如下圖）：",
        size_pt=11, space_after=3, line_spacing=1.2
    )
    if os.path.exists(diagram_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(2)
        p_img.paragraph_format.space_after = Pt(3)
        run_img = p_img.add_run()
        run_img.add_picture(diagram_path, width=Inches(6.2))
        
    add_p(doc,
        "   (1) 依照上圖的排列規律，當排成 n 張正方形桌子時，總共可以坐（　　　　　）人。（請以含有 n 的算式表示）\n"
        "   (2) 若場務組在休息區排出一條由 15 張正方形桌子接成的長桌，總共可以提供（　　　　　）個座位。",
        size_pt=11, space_after=6, line_spacing=1.25
    )
    
    # Q4
    add_p(doc,
        "4.【宣傳組的錦旗裁切與彩帶條數比較】\n"
        "   宣傳組買了一捆長 3.6 公尺的紅布條，以及第一卷、第二卷各長 52.8 公尺的金色裝飾彩帶：\n"
        "   (1) 將長 3.6 公尺的紅布條，每 0.45 公尺剪成一段製作三角錦旗，剛好可以剪成（　　　　　）段。\n"
        "   (2) 兩卷各長 52.8 公尺的金色裝飾彩帶中，第一卷每 0.96 公尺剪成一條，第二卷每 1.05 公尺剪成一條。不用計算，請比較兩卷剪出來的彩帶總條數，在 □ 裡填入 ＞、＜ 或 ＝：\n"
        "       第一卷剪出的條數 {{eq:52.8 ÷ 0.96}}　□　第二卷剪出的條數 {{eq:52.8 ÷ 1.05}}",
        size_pt=11, space_after=6, line_spacing=1.25
    )
    
    # Q5
    add_p(doc,
        "5.【紀念品攤位的校慶徽章禮盒配置】\n"
        "   紀念品攤位推出「60週年經典徽章組」，規定每個標準禮盒內都固定放入 15 枚銀色校徽與 9 枚金色校徽：\n"
        "   (1) 標準禮盒中，「銀色校徽數量」對「金色校徽數量」的比值是（　　　　　）（請化為最簡分數）。\n"
        "   (2) 為了推出「典藏大禮盒」，籌備組決定維持相同的金、銀校徽比例進行擴充。若一個典藏大禮盒中放入了 24 枚金色校徽，則應該搭配放入（　　　　　）枚銀色校徽。",
        size_pt=11, space_after=6, line_spacing=1.25
    )
        
    add_p(doc, "", space_after=4)
    
    # Section 3 (Original wording preserved, fractions converted to native OMML)
    add_section_header(doc, "三、 工坊實作核心精算題（每題 4 分，共 20 分）")
    add_p(doc, "※ 請在題目下方方框內寫出完整的直式或計算過程，答案需化至最簡分數或最簡整數比。", size_pt=10, italic=True, space_after=5)
    
    q3_items = [
        ("1.【紀念禮盒分裝】\n"
         "籌備會收到贊助的 84 瓶能量飲與 126 盒營養棒，要分裝成慰勞禮包平分給工作人員，每包的能量飲一樣多，營養棒也一樣多，且剛好分完。請用短除法求出：最多可以分裝成幾包？此時每包有幾瓶能量飲和幾盒營養棒？", "包；每包有 ____ 瓶、____ 盒"),
         
        ("2.【穀物烘焙用量】\n"
         "烘焙工坊製作一整盤燕麥餅乾需要 {{eq:1_3/5}} kg 的有機麵粉，廚房現有 {{eq:5_1/3}} kg 的麵粉。請問廚房的麵粉一共可以製作多少盤燕麥餅乾？（答案用最簡分數表示）", "盤"),
         
        ("3.【蜂巢展架幾何規律】\n"
         "創客組利用木條拼接成相連的正六邊形蜂巢造型展示架。排 1 個正六邊形需要 6 根木條；每多排 1 個相連的正六邊形，因為共用一條邊，只需要增加 5 根木條（排 1 個用 6 根、排 2 個用 11 根、排 3 個用 16 根……）。\n"
         "(1) 寫出排 n 個相連正六邊形所需木條數量的關係式。（2分）\n"
         "(2) 若組內目前共有 106 根木條，最多可以圍出幾個相連的正六邊形？（2分）", "(1) 關係式：______________ (2) 最多圍出 ____ 個"),
         
        ("4.【清潔洗劑分裝】\n"
         "大會進貨了 39.1 L 的天然茶樹洗手乳，準備分裝到容量為 0.85 L 的小按壓瓶中供各攤位使用。請問剛好可以裝滿多少瓶？（請列出直式計算）", "瓶"),
         
        ("5.【原料配方化簡】\n"
         "請將下列各組原料配方的比化為最簡整數比：（每小題 2 分，共 4 分）\n"
         "(1) 麵粉與特級奶油的重量比是 1.75 : 0.7。\n"
         "(2) 濃縮果汁與氣泡水的容量比是 {{eq:5/6 : 1_1/4}}。", "(1) 最簡整數比：__________ (2) 最簡整數比：__________")
    ]
    for q_text, ans_unit in q3_items:
        add_p(doc, q_text, size_pt=11, bold=False, space_after=3, line_spacing=1.2)
        add_calc_space(doc, height_inches=1.1, answer_prefix=f"答：")
        
    add_p(doc, "", space_after=4)
    
    # Section 4 (Original wording preserved, fractions converted to native OMML)
    add_section_header(doc, "四、 園遊會營運情境素養應用題（每題 5 分，共 50 分）")
    add_p(doc, "※ 請寫出清楚列式、計算過程與單位，否則不予計分。", size_pt=10, italic=True, space_after=5)
    
    q4_items = [
        ("【模組 A：會場動線與綠蔭大道】\n"
         "1. 園遊會迎賓入口是一條全長 480 m 的綠蔭大道，籌備組計畫在大道單側擺放校慶彩旗，從起點到終點兩端都要插旗，相鄰兩面彩旗之間的間距均為 15 m。請問一共需要準備多少面彩旗？", "面"),
         
        ("2. 校園中央有一座圓形生態景觀池，池塘周長為 180 m。為了夜間晚會安全，大會沿著生態池的周圍每隔 4.5 m 設置一盞景觀地燈。請問繞著生態池一周一共需要設置幾盞地燈？", "盞"),
         
        ("3. 舞台區前方有一塊長 360 cm、寬 240 cm 的長方形展演平台，籌備組要用大小相同且邊長為整數公分的正方形防滑地墊鋪滿整塊平台，地墊不能切割且剛好鋪滿。請問防滑地墊的最大邊長是多少公分？此時最少需要幾塊地墊？", "最大邊長 ____ 公分，最少需要 ____ 塊地墊"),
         
        ("4. 校慶主舞台設置了節能燈光秀，綠色雷射燈每隔 24 秒旋轉一次，藍色追光燈每隔 36 秒閃爍一次。上午 9:00 時兩盞燈同時啟動。\n"
         "(1) 請問下一次兩盞燈同時動作是在上午 9 點幾分幾秒？（3分）\n"
         "(2) 從上午 9:00 到 9:06 期間（包含 9:00 與 9:06），兩盞燈一共同時動作了幾次？（2分）", "(1) 上午 9 點 ____ 分 ____ 秒 (2) 一共同時動作 ____ 次"),
         
        ("【模組 B：烘焙工坊與綠色物資採購】\n"
         "5. 手作烘焙組將剛出爐的 12 kg 減碳燕麥餅乾分裝成小袋出售，每小袋裝 {{eq:3/8}} kg。工坊一共可以裝成幾袋？若每小袋餅乾定價為 65 元且全數售罄，烘焙組共可獲得多少元？", "共裝成 ____ 袋，可獲得 ____ 元"),
         
        ("6. 小農市集運來一桶特級龍眼蜂蜜，製作蜜香紅茶用去了整桶蜂蜜的 {{eq:5/7}}，秤重得知用去了 {{eq:3_3/4}} kg。請問這桶蜂蜜原本未開封時的總重量是多少公斤？", "公斤"),
         
        ("7. 物資巡邏組志工騎乘綠能電動車在會場各展區配送物資，連續行駛了 5.76 km，儀表板記錄共花了 12.8 分鐘。請問志工平均每分鐘行駛多少公里？", "公里/分鐘"),
         
        ("8. 自治會為點心攤位採購爆米花玉米粒，走訪市場兩家農會：\n"
         "• 甲農會：一袋重量 2.4 kg，特價 158 元。\n"
         "• 乙農會：一袋重量 3.5 kg，特價 235 元。\n"
         "請分別用四捨五入法求商到小數點後第一位，算出兩家農會每公斤玉米粒的單價，並說明買哪一家農會的玉米粒比較划算？", "甲農會每公斤約 ____ 元，乙農會每公斤約 ____ 元；買 ______ 比較划算"),
         
        ("【模組 C：特調工坊與利潤分配】\n"
         "9. 飲品工坊推出人氣商品「招牌翡翠檸檬飲」，店長黃金配方規定「新鮮檸檬原汁對綠茶的容量比是 2 : 15」。今天工坊準備調製一大桶飲品，已經倒入 450 mL 的新鮮檸檬原汁，請問需要加入多少毫升的綠茶？", "毫升"),
         
        ("10. 園遊會圓滿落幕，六年一班與六年二班合辦的創客市集扣除所有食材成本後，共結餘淨利潤 9600 元。兩班自治會協商，決定依照當天各班投入的志工服務總時數進行按比例分配：六年一班服務總時數為 35 小時，六年二班為 45 小時。請問六年一班和六年二班各可分得多少元的盈餘？", "六年一班分得 ____ 元，六年二班分得 ____ 元")
    ]
    for q_text, ans_unit in q4_items:
        add_p(doc, q_text, size_pt=11, bold=False, space_after=3, line_spacing=1.2)
        add_calc_space(doc, height_inches=1.15, answer_prefix=f"答：{ans_unit}　")
        
    doc.save(output_path)
    print(f"Exam paper saved to: {output_path}")

def generate_answer_docx(output_path):
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.6)
        s.bottom_margin = Inches(0.6)
        s.left_margin = Inches(0.75)
        s.right_margin = Inches(0.75)
        s.page_width = Inches(8.27)
        s.page_height = Inches(11.69)
        
    # Title Block
    add_p(doc, "臺中市鹿陽國民小學 115 學年度第一學期", font_name="標楷體", size_pt=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
    add_p(doc, "六年級數學領域期中定期評量——教師解答與評分標準", font_name="標楷體", size_pt=16, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
    add_p(doc, "命題範圍：康軒版第 1 單元 ～ 第 5 單元　　滿分：100 分（各單元配分各 20 分）", font_name="標楷體", size_pt=10.5, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6)
    
    # Balance table
    add_section_header(doc, "📊 命題單元配分檢核表（驗證每單元恰得 20 分）")
    table = doc.add_table(rows=7, cols=7)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["單元名稱", "選擇 (2分)", "填空 (2分)", "計算 (4分)", "應用 (5分)", "單元總分", "比重"]
    for j, h in enumerate(headers):
        c = table.cell(0, j)
        set_cell_background(c, "E2E8F0")
        set_cell_margins(c, top=60, bottom=60, left=80, right=80)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_run(p, h, font_name="標楷體", size_pt=9.5, bold=True)
        
    rows_data = [
        ("第 1 單元：最大公因數與最小公倍數", "第 1 題 (2分)", "第 1 題 (2格=4分)", "第 1 題 (4分)", "第 3、4 題 (10分)", "20 分", "20%"),
        ("第 2 單元：分數除法", "第 2 題 (2分)", "第 2 題 (2格=4分)", "第 2 題 (4分)", "第 5、6 題 (10分)", "20 分", "20%"),
        ("第 3 單元：數量關係", "第 3 題 (2分)", "第 3 題 (2格=4分)", "第 3 題 (4分)", "第 1、2 題 (10分)", "20 分", "20%"),
        ("第 4 單元：小數除法", "第 4 題 (2分)", "第 4 題 (2格=4分)", "第 4 題 (4分)", "第 7、8 題 (10分)", "20 分", "20%"),
        ("第 5 單元：比與比值", "第 5 題 (2分)", "第 5 題 (2格=4分)", "第 5 題 (4分)", "第 9、10 題 (10分)", "20 分", "20%"),
        ("大題配分合計", "10 分", "20 分", "20 分", "50 分", "100 分", "100%")
    ]
    for i, r_data in enumerate(rows_data):
        bg = "F8FAFC" if i % 2 == 0 else "FFFFFF"
        if i == len(rows_data) - 1:
            bg = "FEF3C7"
        for j, val in enumerate(r_data):
            c = table.cell(i+1, j)
            set_cell_background(c, bg)
            set_cell_margins(c, top=50, bottom=50, left=60, right=60)
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if j > 0 else WD_ALIGN_PARAGRAPH.LEFT
            add_run(p, val, font_name="標楷體", size_pt=9, bold=(i == len(rows_data)-1 or j == 5))
            
    add_p(doc, "", space_after=6)
    
    # Section 1 Answers
    add_section_header(doc, "一、 觀念辨析選擇題（每題 2 分，共 10 分）")
    s1_ans = [
        ("1. 答案：③", "【解析】① 錯誤：2 是偶數也是質數；② 錯誤：8 和 9 互質但皆為合數；③ 正確：最小質數是 2，最小合數是 4；④ 錯誤：兩個大於 1 的數相乘必為合數。"),
        ("2. 答案：①", "【解析】除數 {{eq:3/4}} < 1 時，所得的商會大於被除數，因此 B > A。"),
        ("3. 答案：③", "【解析】數量關係之「差不變」本質。兩人的年齡差距永遠為 36 - 12 = 24 歲。"),
        ("4. 答案：②", "【解析】直式小數除法中，商的小數點必須對齊被除數移動後的新小數點位置。"),
        ("5. 答案：④", "【解析】檸檬汁 3 份，綠茶 8 份，全體總量為 3 + 8 = 11 份，故檸檬汁占全體容量的 {{eq:3/11}}，而非 {{eq:3/8}}。")
    ]
    for a_title, a_desc in s1_ans:
        p = add_p(doc, a_title + "　", font_name="標楷體", size_pt=10.5, bold=True, space_after=2)
        add_run(p, a_desc, font_name="標楷體", size_pt=10, bold=False, color=RGBColor(71, 85, 105))
        
    add_p(doc, "", space_after=4)
    
    # Section 2 Answers
    add_section_header(doc, "二、 展區規格填填看（每格 2 分，共 20 分）")
    s2_ans = [
        "1. (1) 18　(2) 360　【情境邏輯】(1) 兩根木條等長裁切無剩餘 ＝＞ 求最大公因數 GCD(72, 90) = 18 cm；(2) 用 72 cm 與 90 cm 木條分別拼湊成正方形邊框的兩邊 ＝＞ 正方形邊長同時為 72 與 90 的公倍數，最短邊長為最小公倍數 LCM(72, 90) = 360 cm。",
        "2. (1) {{eq:2/3}}　(2) ＜　【情境邏輯】(1) 求果露占空瓶容量的幾分之幾：{{eq:8/15 ÷ 4/5 = 2/3}}（未約分扣1分）；(2) 相同總重分裝，甲桶每盒裝 {{eq:7/6}} kg (>1)，乙桶每盒裝 {{eq:6/7}} kg (<1)，每盒裝越重則裝出盒數越少，故甲盒數 ＜ 乙盒數。",
        "3. (1) 2n + 2（或 4 + 2(n-1)）　(2) 32　【情境邏輯】左右兩端固定共坐 2 人，每張方桌上下兩側各坐 1 人（共 2 人），故 n 張可坐 2n + 2 人；代入 n = 15 得 32 個座位。",
        "4. (1) 8　(2) ＞　【情境邏輯】(1) 紅布條等長裁剪段數：3.6 ÷ 0.45 = 360 ÷ 45 = 8 段；(2) 相同總長裁剪，第一卷每條剪 0.96 m (<1)，第二卷每條剪 1.05 m (>1)，每條越短剪出條數越多，故填 ＞。",
        "5. (1) {{eq:5/3}}（或 {{eq:1_2/3}}）　(2) 40　【情境邏輯】(1) 銀色校徽對金色校徽比值 = {{eq:15/9 = 5/3}}；(2) 維持相同比例擴充：15 : 9 = □ : 24，求得應放入 40 枚銀色校徽。"
    ]
    for a in s2_ans:
        add_p(doc, a, font_name="標楷體", size_pt=10, space_after=4, line_spacing=1.25)
        
    add_p(doc, "", space_after=4)
    
    # Section 3 Answers
    add_section_header(doc, "三、 工坊實作核心精算題（每題 4 分，共 20 分）")
    s3_ans = [
        ("1.【紀念禮盒分裝】",
         "【完整算式與短除法】\n"
         "  2 |  84   126\n"
         "  3 |  42    63\n"
         "  7 |  14    21\n"
         "        2     3\n"
         "最大公因數 = 2 × 3 × 7 = 42（包）\n"
         "每包能量飲：84 ÷ 42 = 2（瓶）；每包營養棒：126 ÷ 42 = 3（盒）\n"
         "【答案】最多可分裝成 42 包；每包有 2 瓶能量飲、3 盒營養棒。\n"
         "【給分規準】正確短除法過程得 2 分；求出 42 包得 1 分；求出每包內容瓶數與盒數得 1 分。"),
         
        ("2.【穀物烘焙用量】",
         "【完整算式】\n"
         "{{eq:5_1/3 ÷ 1_3/5 = 16/3 ÷ 8/5 = 16/3 × 5/8 = 10/3 = 3_1/3}}\n"
         "【答案】{{eq:3_1/3}} 盤（或 {{eq:10/3}} 盤）\n"
         "【給分規準】化假分數並改寫為乘以倒數得 2 分；約分計算過程正確得 1 分；答案化為最簡分數或帶分數並附單位得 1 分（未約分扣 1 分）。"),
         
        ("3.【蜂巢展架幾何規律】",
         "【完整解析】\n"
         "(1) 排 1 個花圃需 6 根木條，每多排 1 個增加 5 根：木條數量 = 6 + 5 × (n - 1) = 5n + 1（根）\n"
         "(2) 當木條總數為 106 根時：5n + 1 = 106 ＝＞ 5n = 105 ＝＞ n = 21（個）\n"
         "【答案】(1) 關係式為 5n + 1 根（或 6 + 5(n-1) 根）；(2) 最多可圍出 21 個。\n"
         "【給分規準】第 (1) 小題關係式正確得 2 分；第 (2) 小題列式求解正確得 2 分。"),
         
        ("4.【清潔洗劑分裝】",
         "【直式計算過程】\n"
         "39.1 ÷ 0.85 = 46\n"
         "（除數小數點向右移 2 位變成 85，被除數小數點同步右移 2 位補 0 變成 3910，3910 ÷ 85 = 46）\n"
         "【答案】46 瓶\n"
         "【給分規準】直式小數點劃掉移動並補 0 計算過程正確得 3 分；商為 46 並附單位得 1 分。"),
         
        ("5.【原料配方化簡】",
         "【計算過程】\n"
         "(1) 1.75 : 0.7 = 175 : 70 = (175 ÷ 35) : (70 ÷ 35) = 5 : 2\n"
         "(2) {{eq:5/6 : 1_1/4 = 5/6 : 5/4}}，同除以 5 得 {{eq:1/6 : 1/4}}，同乘 12 得 2 : 3\n"
         "【答案】(1) 5 : 2；(2) 2 : 3。\n"
         "【給分規準】第 (1) 小題化簡正確得 2 分；第 (2) 小題化簡正確得 2 分（未化為互質整數比各扣 1 分）。")
    ]
    for q_t, q_b in s3_ans:
        add_p(doc, q_t, font_name="標楷體", size_pt=10.5, bold=True, space_after=1)
        add_p(doc, q_b, font_name="標楷體", size_pt=9.5, space_after=4, line_spacing=1.2)
        
    add_p(doc, "", space_after=4)
    
    # Section 4 Answers
    add_section_header(doc, "四、 園遊會營運情境素養應用題（每題 5 分，共 50 分）")
    s4_ans = [
        ("1.【綠蔭大道彩旗設置】（單元 3）",
         "【算式】間隔數 = 480 ÷ 15 = 32（個）；兩端都設：彩旗數 = 32 + 1 = 33（面）\n"
         "【答案】33 面\n"
         "【給分規準】求出間隔數 32 得 3 分；加 1 求得 33 面並附單位得 2 分（漏寫加 1 扣 2 分）。"),
         
        ("2.【圓形生態池地燈】（單元 3）",
         "【算式】圓形為封閉圖形，地燈數 = 間隔數：180 ÷ 4.5 = 40（盞）\n"
         "【答案】40 盞\n"
         "【給分規準】列式正確得 3 分；算出 40 盞並附單位得 2 分（誤加 1 或減 1 扣 2 分）。"),
         
        ("3.【防滑地墊鋪滿平台】（單元 1）",
         "【算式】360 與 240 的最大公因數為 120（cm）；長需鋪：360 ÷ 120 = 3（塊）；寬需鋪：240 ÷ 120 = 2（塊）；總塊數 = 3 × 2 = 6（塊）\n"
         "【答案】最大邊長是 120 公分；最少需要 6 塊地墊。\n"
         "【給分規準】求出最大公因數 120 公分得 3 分；求出最少需要 6 塊地墊得 2 分。"),
         
        ("4.【節能燈光秀週期循環】（單元 1）",
         "【算式】(1) 24 與 36 的最小公倍數 = 72（秒）= 1 分 12 秒，故下一次同時動作為上午 9 點 1 分 12 秒；(2) 6 分鐘 = 360 秒，360 ÷ 72 = 5（次週期），包含 9:00 起點共動作 5 + 1 = 6（次）。\n"
         "【答案】(1) 上午 9 點 1 分 12 秒；(2) 6 次。\n"
         "【給分規準】第 (1) 小題求得最小公倍數並換算時間得 3 分；第 (2) 小題算出 6 次得 2 分。"),
         
        ("5.【燕麥餅乾分裝與總收益】（單元 2）",
         "【算式】袋數 = {{eq:12 ÷ 3/8 = 12 × 8/3 = 32}}（袋）；總收益 = 65 × 32 = 2080（元）\n"
         "【答案】共可裝成 32 袋；共可獲得 2080 元。\n"
         "【給分規準】分數除法求出 32 袋得 3 分；計算出總金額 2080 元並附單位得 2 分。"),
         
        ("6.【龍眼蜂蜜原始總重】（單元 2）",
         "【算式】總重 = {{eq:3_3/4 ÷ 5/7 = 15/4 × 7/5 = 21/4 = 5_1/4}}（kg）\n"
         "【答案】{{eq:5_1/4}} 公斤（或 5.25 公斤、{{eq:21/4}} 公斤）\n"
         "【給分規準】列出等分除算式得 3 分；計算出最簡分數並附單位得 2 分。"),
         
        ("7.【綠能電動車平均時速】（單元 4）",
         "【算式】5.76 ÷ 12.8 = 0.45（公里/分鐘）\n"
         "【答案】平均每分鐘行駛 0.45 公里\n"
         "【給分規準】列式正確得 2 分；小數直式計算無誤得 2 分；寫出正確答案與單位得 1 分。"),
         
        ("8.【爆米花玉米粒採購比價】（單元 4）",
         "【算式】甲農會：158 ÷ 2.4 = 65.833... ≈ 65.8（元/kg）；乙農會：235 ÷ 3.5 = 67.142... ≈ 67.1（元/kg）；比較：65.8 < 67.1，甲農會較便宜。\n"
         "【答案】甲農會每公斤約 65.8 元，乙農會每公斤約 67.1 元；買甲農會比較划算。\n"
         "【給分規準】甲農會四捨五入求商到小數第一位得 2 分；乙農會得 2 分；得出正確比較決策得 1 分。"),
         
        ("9.【招牌翡翠檸檬飲特調】（單元 5）",
         "【算式】設需要綠茶 □ mL。2 : 15 = 450 : □ ＝＞ 450 ÷ 2 = 225 ＝＞ □ = 15 × 225 = 3375（mL）\n"
         "【答案】需要加入 3375 毫升的綠茶\n"
         "【給分規準】列出正確比例式或比值式得 2 分；求出倍數或計算過程正確得 2 分；算出 3375 mL 得 1 分。"),
         
        ("10.【創客市集利潤分配】（單元 5）",
         "【算式】時數比 = 35 : 45 = 7 : 9；總份數 = 7 + 9 = 16 份；每份金額 = 9600 ÷ 16 = 600（元）；一班分得：7 × 600 = 4200（元）；二班分得：9 × 600 = 5400（元）\n"
         "【答案】六年一班分得 4200 元；六年二班分得 5400 元。\n"
         "【給分規準】列出比例或求出每份/每小時金額得 2 分；算出六年一班 4200 元得 1.5 分；算出六年二班 5400 元得 1.5 分。")
    ]
    for q_t, q_b in s4_ans:
        add_p(doc, q_t, font_name="標楷體", size_pt=10.5, bold=True, space_after=1)
        add_p(doc, q_b, font_name="標楷體", size_pt=9.5, space_after=4, line_spacing=1.2)
        
    doc.save(output_path)
    print(f"Answer key saved to: {output_path}")

if __name__ == "__main__":
    docs_dir = r"d:\antigravity\數學\docs"
    exam_path = os.path.join(docs_dir, "115上_六年級數學期中評量試卷.docx")
    ans_path = os.path.join(docs_dir, "115上_六年級數學期中評量_解答與評分標準.docx")
    diagram_path = os.path.join(docs_dir, "table_pattern.png")
    
    generate_exam_docx(exam_path, diagram_path)
    generate_answer_docx(ans_path)
    print("All Word documents updated with OMML math & embedded diagram!")
