"""
Cálculo da necessidade de calagem pelo método da saturação por bases (V%).

Referência: RAIJ, B. van; CANTARELLA, H.; QUAGGIO, J. A.; FURLANI, A. M. C.
Recomendações de adubação e calagem para o estado de São Paulo. 2. ed.
Campinas: Instituto Agronômico (IAC), 1996. (Boletim Técnico, 100).

Fórmula (T em cmolc/dm3):
    NC (t/ha) = T x (V2 - V1) / PRNT

Se T (CTC) vier em mmolc/dm3 - comum em laudos de laboratório no padrão
IAC/SP - é preciso dividir por 10 antes de aplicar a fórmula acima, senão
o resultado sai 10x maior que o correto (erro documentado na literatura
técnica). Este módulo faz essa conversão automaticamente a partir de
`unidade_ctc`.

Onde:
    CTC  = capacidade de troca catiônica a pH 7,0
    V1   = saturação por bases atual do solo (%)
    V2   = saturação por bases desejada para a cultura (%)
    PRNT = poder relativo de neutralização total do calcário (%)

Pressupõe camada padrão de 0-20 cm. Se V2 <= V1, não há necessidade de
calagem (NC = 0).
"""

from dataclasses import dataclass
from typing import Literal

UnidadeCTC = Literal["cmolc", "mmolc"]


@dataclass
class ResultadoCalagem:
    nc_t_ha: float
    nc_kg_ha: float
    total_t: float | None
    total_kg: float | None


def calcular_nc_saturacao_bases(
    ctc: float,
    v1: float,
    v2: float,
    prnt: float,
    area_ha: float | None = None,
    unidade_ctc: UnidadeCTC = "cmolc",
) -> ResultadoCalagem:
    """
    Método da saturação por bases (V%) - Boletim 100/IAC (Raij et al., 1996).

    NC (t/ha) = CTC(cmolc/dm3) x (V2 - V1) / PRNT

    Se CTC vier em mmolc/dm3 (comum em laudos IAC/SP), divide por 10 antes
    de aplicar a fórmula - senão o resultado sai 10x maior que o correto.

    Pressupõe camada padrão de 0-20 cm. Se V2 <= V1, NC = 0.
    """
    if ctc <= 0:
        raise ValueError("CTC deve ser maior que zero.")
    if not (0 <= v1 <= 100):
        raise ValueError("V1 (saturação atual) deve estar entre 0 e 100%.")
    if not (0 <= v2 <= 100):
        raise ValueError("V2 (saturação desejada) deve estar entre 0 e 100%.")
    if not (0 < prnt <= 100):
        raise ValueError("PRNT deve estar entre 0 (exclusivo) e 100%.")
    if unidade_ctc not in ("cmolc", "mmolc"):
        raise ValueError("unidade_ctc deve ser 'cmolc' ou 'mmolc'.")

    ctc_cmolc = ctc / 10 if unidade_ctc == "mmolc" else ctc

    nc_t_ha = max(0.0, ctc_cmolc * (v2 - v1) / prnt)
    nc_kg_ha = nc_t_ha * 1000

    total_t = None
    total_kg = None
    if area_ha is not None:
        if area_ha <= 0:
            raise ValueError("Área deve ser maior que zero.")
        total_t = nc_t_ha * area_ha
        total_kg = nc_kg_ha * area_ha

    return ResultadoCalagem(nc_t_ha=nc_t_ha, nc_kg_ha=nc_kg_ha, total_t=total_t, total_kg=total_kg)


if __name__ == "__main__":
    # Caso 1 - exemplo publicado (agronomiacomgismonti.blogspot.com, método
    # saturação por bases): Ca=4,0 + Mg=1,73 + K=0,19 cmolc/dm3 (S=5,92),
    # H+Al=8,1 -> T=14,02 cmolc/dm3; V1=42,22%; V2=70%; PRNT=85% -> NC ~4,6 t/ha
    r1 = calcular_nc_saturacao_bases(ctc=14.02, v1=42.22, v2=70, prnt=85, unidade_ctc="cmolc")
    print("Caso 1 (cmolc):", r1)
    assert abs(r1.nc_t_ha - 4.6) < 0.05, f"Esperado ~4.6, obtido {r1.nc_t_ha}"

    # Caso 2 - mesma CTC expressa em mmolc/dm3 (140.2) deve dar o mesmo
    # resultado que o caso 1, comprovando a conversão de unidade.
    r2 = calcular_nc_saturacao_bases(ctc=140.2, v1=42.22, v2=70, prnt=85, unidade_ctc="mmolc")
    print("Caso 2 (mmolc, deve bater com caso 1):", r2)
    assert abs(r2.nc_t_ha - r1.nc_t_ha) < 1e-6

    # Caso 3 - exemplo do erro documentado na literatura: CTC=50 mmolc/dm3,
    # V1=?, V2=40% (V1 tal que V2-V1 equivale ao caso citado) -> checagem de
    # ordem de grandeza: mmolc sem conversão daria 10x o valor correto.
    r3_certo = calcular_nc_saturacao_bases(ctc=50, v1=0, v2=40, prnt=100, unidade_ctc="mmolc")
    r3_errado = calcular_nc_saturacao_bases(ctc=5, v1=0, v2=40, prnt=100, unidade_ctc="cmolc")  # 50 mmolc = 5 cmolc
    assert abs(r3_certo.nc_t_ha - r3_errado.nc_t_ha) < 1e-9
    print("Caso 3 (conversão mmolc->cmolc consistente):", r3_certo.nc_t_ha, "t/ha")

    print("OK: cálculo conferido contra exemplo de fonte externa e contra "
          "o erro clássico de unidade documentado na literatura.")
