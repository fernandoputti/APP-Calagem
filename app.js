/*
 * Lógica de cálculo da necessidade de calagem - espelha calagem_calc.py.
 * Método da saturação por bases (V%) - Boletim 100/IAC.
 */
function calcularNCBases(ctc, v1, v2, prnt, areaHa, unidadeCtc) {
  if (!(ctc > 0)) throw new Error("CTC deve ser maior que zero.");
  if (!(v1 >= 0 && v1 <= 100)) throw new Error("V1 (saturação atual) deve estar entre 0 e 100%.");
  if (!(v2 >= 0 && v2 <= 100)) throw new Error("V2 (saturação desejada) deve estar entre 0 e 100%.");
  if (!(prnt > 0 && prnt <= 100)) throw new Error("PRNT deve estar entre 0 (exclusivo) e 100%.");

  const ctcCmolc = unidadeCtc === "mmolc" ? ctc / 10 : ctc;
  const ncTHa = Math.max(0, (ctcCmolc * (v2 - v1)) / prnt);
  const ncKgHa = ncTHa * 1000;

  let totalT = null;
  let totalKg = null;
  if (areaHa !== null) {
    if (!(areaHa > 0)) throw new Error("Área deve ser maior que zero.");
    totalT = ncTHa * areaHa;
    totalKg = ncKgHa * areaHa;
  }

  return { ncTHa, ncKgHa, totalT, totalKg, semNecessidade: v2 <= v1 };
}

function parseNumero(valor) {
  if (valor === null || valor === undefined) return null;
  const limpo = valor.trim().replace(",", ".");
  if (limpo === "") return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : NaN;
}

function formatarResultado(r) {
  let texto = `Necessidade de calagem: ${r.ncTHa.toFixed(3)} t/ha  (${r.ncKgHa.toFixed(1)} kg/ha)`;
  if (r.totalT !== null) {
    texto += `\nTotal para a área informada: ${r.totalT.toFixed(3)} t  (${r.totalKg.toFixed(1)} kg)`;
  }
  return texto;
}

document.getElementById("form-bases")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const resultadoEl = document.getElementById("resultado-bases");
  const erroEl = document.getElementById("erro-bases");
  resultadoEl.classList.remove("visivel");
  erroEl.classList.remove("visivel");

  const ctc = parseNumero(document.getElementById("ctc").value);
  const v1 = parseNumero(document.getElementById("v1").value);
  const v2 = parseNumero(document.getElementById("v2").value);
  const prnt = parseNumero(document.getElementById("prnt").value);
  const area = parseNumero(document.getElementById("area").value);
  const unidade = document.querySelector('input[name="unidade"]:checked').value;

  if ([ctc, v1, v2, prnt].some((v) => v === null || Number.isNaN(v)) || (area !== null && Number.isNaN(area))) {
    erroEl.textContent = "Preencha os campos numéricos corretamente.";
    erroEl.classList.add("visivel");
    return;
  }

  try {
    const r = calcularNCBases(ctc, v1, v2, prnt, area, unidade);
    resultadoEl.textContent = r.semNecessidade
      ? "Solo já está com saturação por bases igual ou acima da desejada.\nNão há necessidade de calagem."
      : formatarResultado(r);
    resultadoEl.classList.add("visivel");
  } catch (err) {
    erroEl.textContent = err.message;
    erroEl.classList.add("visivel");
  }
});
