import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch

fig, ax = plt.subplots(figsize=(8, 9))
ax.set_xlim(0, 10)
ax.set_ylim(0, 11)
ax.axis("off")

verde = "#1b5e20"
marrom = "#6b4a34"
areia = "#f2e8d5"
branco = "#ffffff"


def caixa(x, y, w, h, texto, cor_borda=verde, cor_fundo=branco, fontsize=9):
    box = mpatches.FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle="round,pad=0.08,rounding_size=0.12",
                                   linewidth=1.6, edgecolor=cor_borda, facecolor=cor_fundo)
    ax.add_patch(box)
    ax.text(x, y, texto, ha="center", va="center", fontsize=fontsize, color="#2b2018", wrap=True)


def losango(x, y, w, h, texto, fontsize=9):
    pts = [(x, y + h / 2), (x + w / 2, y), (x, y - h / 2), (x - w / 2, y)]
    diamond = plt.Polygon(pts, closed=True, edgecolor=marrom, facecolor=areia, linewidth=1.6)
    ax.add_patch(diamond)
    ax.text(x, y, texto, ha="center", va="center", fontsize=fontsize, color="#2b2018")


def seta(x1, y1, x2, y2):
    arrow = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>", mutation_scale=14, color="#4e342e", linewidth=1.3)
    ax.add_patch(arrow)


caixa(5, 10.3, 6.2, 0.8, "Início: usuário preenche CTC, V1, V2, PRNT\n(e área, opcional)")
seta(5, 9.9, 5, 9.3)

losango(5, 8.4, 5.4, 1.6, "Campos numéricos\nválidos?")
seta(7.7, 8.4, 8.6, 8.4)
ax.text(8.15, 8.65, "não", fontsize=8, ha="center")
caixa(8.6, 8.4, 2.0, 0.7, "Exibe mensagem\nde erro", cor_borda="#a03030")
seta(8.6, 8.05, 5.3, 7.4)

seta(5, 7.6, 5, 7.0)
ax.text(5.2, 7.3, "sim", fontsize=8, ha="left")

caixa(5, 6.3, 6.4, 1.0, "Converte CTC para cmolc/dm³\nse informada em mmolc/dm³ (÷10)", cor_borda=verde)
seta(5, 5.75, 5, 5.15)

caixa(5, 4.5, 6.4, 1.0, "Aplica a fórmula:\nNC = CTC × (V2 − V1) / PRNT")
seta(5, 3.95, 5, 3.35)

losango(5, 2.5, 5.0, 1.5, "V2 > V1?")
seta(7.5, 2.5, 8.6, 2.5)
ax.text(8.05, 2.75, "não", fontsize=8, ha="center")
caixa(8.6, 2.5, 2.0, 0.9, "Exibe \"não há\nnecessidade\nde calagem\"", cor_borda=marrom, fontsize=7.5)

seta(5, 1.75, 5, 1.15)
ax.text(5.2, 1.45, "sim", fontsize=8, ha="left")
caixa(5, 0.6, 6.2, 0.8, "Exibe NC (t/ha, kg/ha) e total para\na área informada, se houver", cor_borda=verde)

ax.set_title("Fluxograma — CalTEC-Calagem (Módulo IAC)", fontsize=13, color=verde, fontweight="bold", pad=14)

plt.tight_layout()
plt.savefig("fluxograma.png", dpi=200, facecolor="white")
print("Fluxograma salvo.")
