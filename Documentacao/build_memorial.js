const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, PageBreak, LevelFormat,
  ImageRun,
} = require("docx");
const fs = require("fs");

const VERDE = "1B5E20";
const MARROM = "6B4A34";
const CINZA_BORDA = "CCCCCC";

const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: CINZA_BORDA },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: CINZA_BORDA },
  left: { style: BorderStyle.SINGLE, size: 4, color: CINZA_BORDA },
  right: { style: BorderStyle.SINGLE, size: 4, color: CINZA_BORDA },
};

function h1(texto) { return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 160 } }); }
function h2(texto) { return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }); }
function p(texto, opts = {}) { return new Paragraph({ children: [new TextRun({ text: texto, ...opts })], spacing: { after: 160 } }); }
function codigo(linhas) {
  return linhas.map((linha) => new Paragraph({ children: [new TextRun({ text: linha.length ? linha : " ", font: "Consolas", size: 16 })], spacing: { after: 0 } }));
}
function celula(texto, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.header ? { type: ShadingType.CLEAR, fill: VERDE } : undefined,
    borders: cellBorders,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: texto, bold: !!opts.header, color: opts.header ? "FFFFFF" : undefined, size: 20 })] })],
  });
}
function tabela(colWidths, linhas) {
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: linhas.map((linha, i) => new TableRow({ children: linha.map((texto, j) => celula(texto, { width: colWidths[j], header: i === 0 })) })),
  });
}

const CALC_INICIO = [
'"""',
"Cálculo da necessidade de calagem pelo método da saturação por bases (V%).",
"",
"Referência: RAIJ, B. van; CANTARELLA, H.; QUAGGIO, J. A.; FURLANI, A. M. C.",
"Recomendações de adubação e calagem para o estado de São Paulo. 2. ed.",
"Campinas: Instituto Agronômico (IAC), 1996. (Boletim Técnico, 100).",
"...",
'"""',
"",
"from dataclasses import dataclass",
"from typing import Literal",
"",
'UnidadeCTC = Literal["cmolc", "mmolc"]',
];

const CALC_FIM = [
"    r3_certo = calcular_nc_saturacao_bases(ctc=50, v1=0, v2=40, prnt=100, unidade_ctc=\"mmolc\")",
"    r3_errado = calcular_nc_saturacao_bases(ctc=5, v1=0, v2=40, prnt=100, unidade_ctc=\"cmolc\")",
"    assert abs(r3_certo.nc_t_ha - r3_errado.nc_t_ha) < 1e-9",
'    print("Caso 3 (conversão mmolc->cmolc consistente):", r3_certo.nc_t_ha, "t/ha")',
"",
'    print("OK: cálculo conferido contra exemplo de fonte externa e contra "',
'          "o erro clássico de unidade documentado na literatura.")',
];

const APP_INICIO = [
'"""',
"Interface gráfica para cálculo da necessidade de calagem.",
"Método: saturação por bases (V%) - Boletim 100/IAC.",
'"""',
"",
"import sys",
"import tkinter as tk",
"from pathlib import Path",
"from tkinter import ttk, messagebox",
"",
"from PIL import Image, ImageTk",
"",
"from calagem_calc import calcular_nc_saturacao_bases",
];

const APP_FIM = [
"        if v2 <= v1:",
'            self.resultado_var.set("Solo já está com saturação por bases igual ou acima da desejada...")',
"            return",
"",
"        texto = f\"Necessidade de calagem: {r.nc_t_ha:.3f} t/ha  ({r.nc_kg_ha:.1f} kg/ha)\"",
"        if r.total_t is not None:",
"            texto += f\"\\nTotal para a área informada: {r.total_t:.3f} t  ({r.total_kg:.1f} kg)\"",
"        self.resultado_var.set(texto)",
"",
"",
'if __name__ == "__main__":',
"    app = CalagemApp()",
"    app.mainloop()",
];

const JS_INICIO = [
"/*",
" * Lógica de cálculo da necessidade de calagem - espelha calagem_calc.py.",
" * Método da saturação por bases (V%) - Boletim 100/IAC.",
" */",
"function calcularNCBases(ctc, v1, v2, prnt, areaHa, unidadeCtc) {",
'  if (!(ctc > 0)) throw new Error("CTC deve ser maior que zero.");',
"  ...",
];

const JS_FIM = [
"  try {",
"    const r = calcularNCBases(ctc, v1, v2, prnt, area, unidade);",
"    resultadoEl.textContent = r.semNecessidade",
'      ? "Solo já está com saturação por bases igual ou acima da desejada..."',
"      : formatarResultado(r);",
'    resultadoEl.classList.add("visivel");',
"  } catch (err) {",
"    erroEl.textContent = err.message;",
'    erroEl.classList.add("visivel");',
"  }",
"});",
];

const capa = [
  new Paragraph({ spacing: { before: 1400 }, children: [] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MEMORIAL DESCRITIVO", bold: true, size: 44, color: VERDE })], spacing: { after: 200 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Registro de Programa de Computador — INPI", size: 24, color: MARROM })], spacing: { after: 600 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CalTEC - Calagem", bold: true, size: 36 })], spacing: { after: 100 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Módulo IAC (Saturação por Bases)", size: 24, color: MARROM })], spacing: { after: 600 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Titular: Fernando Ferrari Putti — UNESP", size: 22 })], spacing: { after: 80 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Coautoria: Jéssica Pigatto de Queiroz Barcelos — UNOESTE", size: 22 })], spacing: { after: 80 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Data de criação: 13/08/2026", size: 22 })], spacing: { after: 80 } }),
  new Paragraph({ children: [new PageBreak()] }),
];

const doc = new Document({
  numbering: { config: [{ reference: "lista-padrao", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 480, hanging: 260 } } } }] }] },
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, color: VERDE }, paragraph: { spacing: { before: 320, after: 160 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, color: MARROM }, paragraph: { spacing: { before: 240, after: 120 } } },
    ],
  },
  sections: [{
    properties: {},
    children: [
      ...capa,

      h1("1. Identificação do Programa"),
      tabela([3200, 6300], [
        ["Campo", "Descrição"],
        ["Título do programa", "CalTEC - Calagem (Módulo IAC)"],
        ["Titular", "Fernando Ferrari Putti — Universidade Estadual Paulista (UNESP)"],
        ["Coautoria", "Jéssica Pigatto de Queiroz Barcelos — Universidade do Oeste Paulista (UNOESTE)"],
        ["Data de criação", "13/08/2026"],
        ["Linguagens de programação", "Python 3.14 (versão desktop); HTML5, CSS3 e JavaScript ES6+ (versão web)"],
        ["Tipo de programa", "Aplicativo utilitário científico (calculadora de recomendação agronômica)"],
        ["Campo de aplicação", "Agronomia — Ciência do Solo, Fertilidade e Corretivos Agrícolas"],
        ["Ambiente operacional", "Windows 10/11 (executável standalone) e navegadores web compatíveis com Progressive Web Apps (PWA)"],
        ["Algoritmo/decisão", "Determinístico: aplica fórmula fechada conforme os dados de solo informados"],
      ]),

      h1("2. Resumo / Descrição Geral"),
      p("Este módulo corresponde à versão inicial do programa CalTEC-Calagem, restrita ao método de recomendação de calagem por Saturação por Bases (V%), conforme o Boletim Técnico 100 do Instituto Agronômico de Campinas (IAC). Recebe os resultados de uma análise de solo (capacidade de troca catiônica, saturação por bases atual e desejada, e poder relativo de neutralização total do calcário) e calcula a necessidade de calagem (NC), em toneladas por hectare e quilogramas por hectare, com opção de cálculo do total para uma área informada."),
      p("Está disponível em duas variantes de distribuição: aplicativo desktop para Windows (executável standalone) e aplicativo web progressivo (PWA), com a mesma lógica de cálculo implementada de forma independente em cada plataforma."),

      h1("3. Descrição Funcional"),
      p("O usuário informa a capacidade de troca catiônica do solo (CTC), podendo escolher a unidade de medida (cmolc/dm³ ou mmolc/dm³, com conversão automática), a saturação por bases atual (V1) e desejada (V2), e o poder relativo de neutralização total (PRNT) do calcário disponível. O programa aplica a fórmula NC (t/ha) = CTC × (V2 − V1) / PRNT e apresenta o resultado em t/ha e kg/ha, calculando também o total de calcário para uma área informada, se fornecida. Caso a saturação desejada seja igual ou inferior à atual, o programa informa que não há necessidade de calagem."),

      h1("4. Fundamentação Científica"),
      p("RAIJ, B. van; CANTARELLA, H.; QUAGGIO, J. A.; FURLANI, A. M. C. Recomendações de adubação e calagem para o estado de São Paulo. 2. ed. Campinas: Instituto Agronômico (IAC), 1996. (Boletim Técnico, 100)."),

      h1("5. Arquitetura e Tecnologias Utilizadas"),
      tabela([3200, 6300], [
        ["Componente", "Tecnologia"],
        ["Lógica de cálculo (desktop)", "Python 3.14 — módulo calagem_calc.py, função pura e independente de interface"],
        ["Interface gráfica (desktop)", "Tkinter/ttk — módulo calagem_app.py"],
        ["Empacotamento (desktop)", "PyInstaller — geração de executável standalone (.exe)"],
        ["Manipulação de imagens", "Pillow (PIL) — carregamento dos logotipos institucionais"],
        ["Lógica de cálculo (web)", "JavaScript ES6+ — arquivo app.js, replica a mesma fórmula do módulo Python"],
        ["Interface (web)", "HTML5 e CSS3 — arquivos index.html e style.css"],
        ["Funcionamento offline", "Web App Manifest e Service Worker (Progressive Web App)"],
      ]),

      h1("6. Fluxograma de Funcionamento"),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ type: "png", data: fs.readFileSync("fluxograma.png"), transformation: { width: 420, height: 473 } })],
        spacing: { after: 200 },
      }),

      h1("7. Trechos do Programa-Fonte (representativos)"),
      p("Os trechos a seguir correspondem às linhas iniciais e finais dos três arquivos de código-fonte principais do programa, apresentados para fins de caracterização de autoria e originalidade, conforme praxe do INPI. O código-fonte completo será apresentado em anexo ao processo de registro, conforme exigido."),

      h2("7.1 calagem_calc.py (módulo de cálculo — versão desktop)"),
      ...codigo(CALC_INICIO), p("(...)", { italics: true }), ...codigo(CALC_FIM),

      h2("7.2 calagem_app.py (interface gráfica — versão desktop)"),
      ...codigo(APP_INICIO), p("(...)", { italics: true }), ...codigo(APP_FIM),

      h2("7.3 app.js (módulo de cálculo e interface — versão web)"),
      ...codigo(JS_INICIO), p("(...)", { italics: true }), ...codigo(JS_FIM),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Memorial_Descritivo_CalTEC-Calagem-IAC.docx", buffer);
  console.log("Memorial (IAC) gerado com sucesso.");
});
