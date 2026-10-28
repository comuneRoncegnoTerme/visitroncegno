import { Courier_Prime, Hanken_Grotesk, IM_Fell_English } from "next/font/google";

// I caratteri dei pannelli del museo: titoli a stampa antica, testo pulito, didascalie a macchina da scrivere.
export const fellEnglish = IM_Fell_English({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--f-display" });
export const hankenGrotesk = Hanken_Grotesk({ weight: ["400", "500", "600"], style: ["normal", "italic"], subsets: ["latin"], variable: "--f-body" });
export const courierPrime = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"], variable: "--f-type" });

export const mulinoFonts = [fellEnglish.variable, hankenGrotesk.variable, courierPrime.variable].join(" ");
