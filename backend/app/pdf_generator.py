from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import json

class NumberedCanvas(canvas.Canvas):
    """Canvas that computes total pages and adds a premium header and footer to every page."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Header on every page
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#6366f1"))
        self.drawString(54, 750, "VIBEINVEST Due Diligence Report")
        
        # Thin header line
        self.setStrokeColor(colors.HexColor("#e5e7eb"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)
        
        # Footer on every page
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#9ca3af"))
        self.drawString(54, 40, "Confidential · Powered by VibeInvest AI Agents")
        self.drawRightString(558, 40, f"Page {self._pageNumber} of {page_count}")
        
        self.restoreState()


def generate_due_diligence_pdf(analysis_data: dict) -> bytes:
    """Generates a professional premium-styled due diligence PDF report using ReportLab."""
    buffer = BytesIO()
    
    # 0.75 in margins (54 points)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()
    
    # Color Palette
    primary_color = colors.HexColor("#4f46e5")  # Indigo
    charcoal_dark = colors.HexColor("#111827")  # Near Black
    charcoal_medium = colors.HexColor("#374151") # Charcoal
    gray_light = colors.HexColor("#f3f4f6")     # Off-white
    border_color = colors.HexColor("#e5e7eb")   # Border grey
    
    # Verdict style mappings
    verdict_colors = {
        "INVEST": colors.HexColor("#10b981"),
        "WATCH": colors.HexColor("#f59e0b"),
        "PASS": colors.HexColor("#ef4444"),
        "ACQUIRE": colors.HexColor("#6366f1")
    }
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=charcoal_dark,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=primary_color,
        spaceAfter=15
    )
    
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=charcoal_dark,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'CharcoalBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=charcoal_medium,
        spaceAfter=8
    )
    
    verdict_badge_style = ParagraphStyle(
        'VerdictBadge',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=16,
        textColor=colors.white,
        alignment=1 # Center
    )

    score_val_style = ParagraphStyle(
        'ScoreVal',
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=32,
        textColor=primary_color,
        alignment=1 # Center
    )
    
    score_label_style = ParagraphStyle(
        'ScoreLabel',
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=charcoal_medium,
        alignment=1 # Center
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=charcoal_dark
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=charcoal_medium
    )

    agent_name_style = ParagraphStyle(
        'AgentName',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=charcoal_dark,
        spaceAfter=1
    )

    agent_role_style = ParagraphStyle(
        'AgentRole',
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#6b7280"),
        spaceAfter=4
    )

    finding_style = ParagraphStyle(
        'FindingStyle',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=charcoal_medium
    )

    story = []

    # --- HEADER / HERO TITLE ---
    story.append(Spacer(1, 10))
    story.append(Paragraph(analysis_data.get("startup_name", "Startup Report"), title_style))
    
    tags = analysis_data.get("tags", [])
    intent_str = f"Intent: {analysis_data.get('intent', 'invest').upper()}"
    tags_str = " · ".join(tags) if tags else "Due Diligence"
    story.append(Paragraph(f"{intent_str}   |   {tags_str}", subtitle_style))

    # --- SCORE & VERDICT BLOCK ---
    score = analysis_data.get("score", 0)
    verdict = analysis_data.get("verdict", "WATCH").upper()
    display_verdict = "REJECTED" if verdict == "PASS" else verdict
    verdict_sub = analysis_data.get("verdict_sub", "").upper()
    v_color = verdict_colors.get(verdict, primary_color)
    
    score_block_data = [
        [
            Paragraph(f"{score}<font size=10> / 1000</font>", score_val_style),
            Paragraph(f"{display_verdict}<br/><font size=8>{verdict_sub}</font>" if verdict_sub else display_verdict, verdict_badge_style)
        ],
        [
            Paragraph("AURA SCORE", score_label_style),
            Paragraph("INVESTMENT VERDICT", score_label_style)
        ]
    ]
    
    score_table = Table(score_block_data, colWidths=[250, 254])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), gray_light),
        ('BACKGROUND', (0, 1), (0, 1), gray_light),
        ('BACKGROUND', (1, 0), (1, 1), v_color),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 15))

    # --- DIMENSIONS & METRICS GRID ---
    story.append(Paragraph("Dimension breakdown", section_title))
    
    # Dimension rows
    dim_data = [[Paragraph("Dimension", table_header_style), Paragraph("Score (out of 100)", table_header_style)]]
    for dim in analysis_data.get("dimensions", []):
        dim_data.append([
            Paragraph(dim.get("name", "Unknown"), table_cell_style),
            Paragraph(f"<b>{dim.get('score', 0)}</b>", table_cell_style)
        ])
    
    dim_table = Table(dim_data, colWidths=[250, 254])
    dim_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), gray_light),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, gray_light]),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
    ]))
    story.append(dim_table)
    story.append(Spacer(1, 15))

    # Key Metrics
    metrics = analysis_data.get("metrics", [])
    if metrics:
        story.append(Paragraph("Key Metrics Surfaced", section_title))
        metric_data = [[Paragraph("Metric Label", table_header_style), Paragraph("Value", table_header_style), Paragraph("Change / Note", table_header_style)]]
        for m in metrics:
            metric_data.append([
                Paragraph(m.get("label", "Label"), table_cell_style),
                Paragraph(f"<b>{m.get('value', 'Value')}</b>", table_cell_style),
                Paragraph(m.get("change", "Change"), table_cell_style)
            ])
        metric_table = Table(metric_data, colWidths=[180, 140, 184])
        metric_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), gray_light),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOX', (0, 0), (-1, -1), 0.5, border_color),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, gray_light]),
            ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ]))
        story.append(metric_table)
        story.append(Spacer(1, 15))

    # Page break before Agent Reports to keep formatting incredibly professional
    story.append(PageBreak())

    # --- AGENT REPORTS ---
    story.append(Paragraph("Detailed Agent due diligence briefs", section_title))
    story.append(Spacer(1, 4))
    
    agent_reports = analysis_data.get("agent_reports", [])
    for agent in agent_reports:
        # Wrap each agent inside a KeepTogether to avoid ugly page splitting
        agent_story = []
        
        # Agent Name & Role
        a_id = agent.get("id", 1)
        badge = agent.get("badge", "").upper()
        agent_story.append(Paragraph(agent.get("name", "AI Agent"), agent_name_style))
        agent_story.append(Paragraph(f"{agent.get('role', 'Brief')}   |   Verdict: <b>{badge}</b>", agent_role_style))
        
        # Agent Paragraph text
        agent_story.append(Paragraph(agent.get("body", ""), body_style))
        
        # Findings bullet list
        findings = agent.get("findings", [])
        if findings:
            findings_data = []
            for f in findings:
                f_type = f.get("type", "warning")
                bullet_color = "#10b981" if f_type == "positive" else ("#f59e0b" if f_type == "warning" else "#ef4444")
                bullet_symbol = f"<font color='{bullet_color}'><b>•</b></font>"
                
                findings_data.append([
                    Paragraph(bullet_symbol, ParagraphStyle('BulletSymbol', fontName='Helvetica-Bold', fontSize=12, leading=14)),
                    Paragraph(f.get("text", ""), finding_style)
                ])
                
            findings_table = Table(findings_data, colWidths=[15, 489])
            findings_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('TOPPADDING', (0, 0), (-1, -1), 2),
            ]))
            agent_story.append(findings_table)
            
        agent_story.append(Spacer(1, 14))
        
        # Render a subtle separator line between agent boxes
        sep_table = Table([[""]], colWidths=[504], rowHeights=[1])
        sep_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        agent_story.append(sep_table)
        agent_story.append(Spacer(1, 10))
        
        story.append(KeepTogether(agent_story))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
