"""
Interface gráfica para cálculo da necessidade de calagem.
Método: saturação por bases (V%) - Boletim 100/IAC.
"""

import sys
import tkinter as tk
from pathlib import Path
from tkinter import ttk, messagebox

from PIL import Image, ImageTk

from calagem_calc import calcular_nc_saturacao_bases

REF_IAC = (
    "RAIJ, B. van et al. Recomendações de adubação e calagem para o estado "
    "de São Paulo. 2. ed. Campinas: IAC, 1996. (Boletim Técnico, 100)."
)

COR_FUNDO = "#f2e8d5"
COR_VERDE = "#1b5e20"
COR_VERDE_CLARO = "#2e7d32"
COR_MARROM = "#6b4a34"


def resource_path(relative_path: str) -> str:
    """Resolve um caminho tanto rodando via `python` quanto no .exe empacotado."""
    base_path = getattr(sys, "_MEIPASS", Path(__file__).resolve().parent)
    return str(Path(base_path) / relative_path)


def carregar_logo(caminho: str, altura: int) -> ImageTk.PhotoImage:
    img = Image.open(caminho)
    razao = altura / img.height
    img = img.resize((max(1, int(img.width * razao)), altura), Image.LANCZOS)
    return ImageTk.PhotoImage(img)


def aplicar_tema(root: tk.Tk) -> None:
    root.configure(background=COR_FUNDO)
    style = ttk.Style(root)
    style.theme_use("clam")
    style.configure(".", background=COR_FUNDO, foreground="#2b2018", font=("Segoe UI", 10))
    style.configure("TFrame", background=COR_FUNDO)
    style.configure("TLabel", background=COR_FUNDO)
    style.configure(
        "TButton", background=COR_VERDE, foreground="white",
        padding=(10, 8), font=("Segoe UI", 10, "bold"), borderwidth=0,
    )
    style.map("TButton", background=[("active", COR_VERDE_CLARO)])
    style.configure("TEntry", padding=6)
    style.configure("TRadiobutton", background=COR_FUNDO)


class CalagemApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Calculadora de Calagem - IAC")
        self.resizable(False, False)
        aplicar_tema(self)

        outer = ttk.Frame(self, padding=15)
        outer.grid(row=0, column=0, sticky="nsew")

        header = ttk.Frame(outer)
        header.grid(row=0, column=0, pady=(0, 10), sticky="ew")
        header.columnconfigure(1, weight=1)

        self._logo_unesp = carregar_logo(resource_path("assets/unesp.jpg"), altura=44)
        ttk.Label(header, image=self._logo_unesp).grid(row=0, column=0, padx=(0, 12))

        ttk.Label(header, text="Calculadora de Calagem - IAC", font=("Segoe UI", 14, "bold")).grid(row=0, column=1)

        self._logo_unoeste = carregar_logo(resource_path("assets/unoeste.png"), altura=40)
        ttk.Label(header, image=self._logo_unoeste).grid(row=0, column=2, padx=(12, 0))

        corpo = ttk.Frame(outer, padding=15)
        corpo.grid(row=1, column=0, sticky="nsew")
        pad = {"padx": 10, "pady": 6}

        ttk.Label(
            corpo, text="Método da saturação por bases (V%) - Boletim 100/IAC",
            font=("Segoe UI", 9, "italic"),
        ).grid(row=0, column=0, columnspan=3, pady=(0, 12), sticky="w")

        self.entries = {}
        campos = [
            ("ctc", "CTC a pH 7,0"),
            ("v1", "Saturação por bases atual - V1 (%)"),
            ("v2", "Saturação por bases desejada - V2 (%)"),
            ("prnt", "PRNT do calcário (%)"),
            ("area", "Área a corrigir (ha) [opcional]"),
        ]
        row0 = 1
        for i, (key, label) in enumerate(campos, start=row0):
            ttk.Label(corpo, text=label).grid(row=i, column=0, sticky="w", **pad)
            entry = ttk.Entry(corpo, width=15)
            entry.grid(row=i, column=1, **pad)
            self.entries[key] = entry

        self.unidade_ctc = tk.StringVar(value="cmolc")
        unidade_frame = ttk.Frame(corpo)
        unidade_frame.grid(row=row0, column=2, sticky="w", **pad)
        ttk.Radiobutton(unidade_frame, text="cmolc/dm³", variable=self.unidade_ctc, value="cmolc").pack(anchor="w")
        ttk.Radiobutton(
            unidade_frame, text="mmolc/dm³ (laudo IAC/SP)", variable=self.unidade_ctc, value="mmolc"
        ).pack(anchor="w")

        ttk.Label(
            corpo,
            text="Confira a unidade no seu laudo de solo antes de calcular —\n"
            "usar a unidade errada muda o resultado em 10x.",
            font=("Segoe UI", 8, "italic"), foreground=COR_MARROM,
        ).grid(row=row0 + len(campos), column=0, columnspan=3, sticky="w", padx=10)

        ttk.Button(corpo, text="Calcular", command=self.calcular).grid(
            row=row0 + len(campos) + 1, column=0, columnspan=3, pady=15
        )

        self.resultado_var = tk.StringVar(value="")
        ttk.Label(corpo, textvariable=self.resultado_var, font=("Segoe UI", 10), justify="left").grid(
            row=row0 + len(campos) + 2, column=0, columnspan=3, sticky="w", padx=10
        )

        ttk.Separator(outer).grid(row=2, column=0, sticky="ew", pady=(12, 6))
        ttk.Label(
            outer, text="Referência:\n" + REF_IAC,
            font=("Segoe UI", 7), foreground=COR_MARROM, justify="left", wraplength=460,
        ).grid(row=3, column=0, sticky="w")

    def calcular(self):
        self.resultado_var.set("")
        try:
            ctc = float(self.entries["ctc"].get().replace(",", "."))
            v1 = float(self.entries["v1"].get().replace(",", "."))
            v2 = float(self.entries["v2"].get().replace(",", "."))
            prnt = float(self.entries["prnt"].get().replace(",", "."))
            area_raw = self.entries["area"].get().strip().replace(",", ".")
            area = float(area_raw) if area_raw else None
        except ValueError:
            messagebox.showerror("Erro", "Preencha os campos numéricos corretamente.")
            return

        try:
            r = calcular_nc_saturacao_bases(ctc=ctc, v1=v1, v2=v2, prnt=prnt, area_ha=area, unidade_ctc=self.unidade_ctc.get())
        except ValueError as e:
            messagebox.showerror("Erro", str(e))
            return

        if v2 <= v1:
            self.resultado_var.set("Solo já está com saturação por bases igual ou acima da desejada.\nNão há necessidade de calagem.")
            return

        texto = f"Necessidade de calagem: {r.nc_t_ha:.3f} t/ha  ({r.nc_kg_ha:.1f} kg/ha)"
        if r.total_t is not None:
            texto += f"\nTotal para a área informada: {r.total_t:.3f} t  ({r.total_kg:.1f} kg)"
        self.resultado_var.set(texto)


if __name__ == "__main__":
    app = CalagemApp()
    app.mainloop()
