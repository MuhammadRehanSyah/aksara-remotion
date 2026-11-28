// MalinKundang lip-sync — cue per frame (24fps) dari Rhubarb, digenerate oleh gen_lipsync.py
// dari src/malin-kundang/audio/vo/<id>-cues.json. JANGAN edit manual — jalankan ulang skripnya.
// Bentuk mulut: A tutup (P/B/M) | B agak terbuka | C terbuka lebar-senyum (E) | D gigi rapat (F/V)
// E bulat (O) | F lebar-sedikit (L) | G gigi (S/Z) | H terbuka lebar (A) | X diam/netral.
// Mulut hanya bergerak saat tokoh itu bicara; di luar dialog = X.
export type Viseme = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";
export type Cue = { f: number; v: Viseme };

export const D1_CUES: Cue[] = [{ f: 385, v: "X" }, { f: 395, v: "B" }, { f: 397, v: "A" }, { f: 399, v: "E" }, { f: 401, v: "A" }, { f: 403, v: "C" }, { f: 406, v: "B" }, { f: 409, v: "E" }, { f: 411, v: "F" }, { f: 413, v: "X" }, { f: 424, v: "F" }, { f: 427, v: "B" }, { f: 429, v: "C" }, { f: 432, v: "H" }, { f: 434, v: "C" }, { f: 437, v: "A" }, { f: 439, v: "E" }, { f: 441, v: "F" }, { f: 443, v: "C" }, { f: 448, v: "B" }];
export const D2_CUES: Cue[] = [{ f: 467, v: "B" }, { f: 473, v: "C" }, { f: 485, v: "B" }, { f: 489, v: "C" }, { f: 491, v: "E" }, { f: 493, v: "X" }, { f: 503, v: "B" }, { f: 510, v: "C" }, { f: 515, v: "B" }, { f: 517, v: "A" }, { f: 519, v: "C" }, { f: 527, v: "B" }, { f: 532, v: "B" }, { f: 534, v: "A" }, { f: 536, v: "E" }, { f: 538, v: "B" }, { f: 541, v: "A" }, { f: 543, v: "B" }];
export const D3_CUES: Cue[] = [{ f: 623, v: "X" }, { f: 625, v: "B" }, { f: 631, v: "H" }, { f: 634, v: "B" }, { f: 636, v: "C" }, { f: 639, v: "X" }, { f: 650, v: "B" }, { f: 654, v: "A" }, { f: 658, v: "A" }, { f: 661, v: "H" }, { f: 664, v: "B" }, { f: 666, v: "C" }];
export const D4_CUES: Cue[] = [{ f: 960, v: "X" }, { f: 962, v: "A" }, { f: 965, v: "A" }, { f: 967, v: "B" }, { f: 974, v: "A" }, { f: 977, v: "C" }, { f: 979, v: "B" }, { f: 984, v: "X" }, { f: 987, v: "B" }, { f: 990, v: "A" }, { f: 992, v: "E" }, { f: 996, v: "A" }, { f: 998, v: "B" }, { f: 1006, v: "X" }, { f: 1012, v: "B" }, { f: 1015, v: "F" }, { f: 1023, v: "B" }, { f: 1031, v: "F" }];
export const D5_CUES: Cue[] = [{ f: 1170, v: "B" }, { f: 1180, v: "A" }, { f: 1182, v: "D" }, { f: 1185, v: "B" }, { f: 1192, v: "X" }, { f: 1202, v: "B" }, { f: 1208, v: "C" }, { f: 1213, v: "H" }, { f: 1216, v: "C" }, { f: 1218, v: "A" }];
export const D6_CUES: Cue[] = [{ f: 1318, v: "D" }, { f: 1321, v: "B" }, { f: 1331, v: "A" }, { f: 1341, v: "B" }, { f: 1343, v: "C" }, { f: 1346, v: "A" }, { f: 1348, v: "F" }, { f: 1356, v: "G" }, { f: 1358, v: "X" }, { f: 1365, v: "B" }, { f: 1371, v: "A" }, { f: 1374, v: "B" }, { f: 1398, v: "F" }, { f: 1400, v: "A" }, { f: 1402, v: "B" }, { f: 1406, v: "E" }, { f: 1412, v: "F" }];
export const D7_CUES: Cue[] = [{ f: 1427, v: "X" }, { f: 1431, v: "B" }, { f: 1443, v: "X" }, { f: 1449, v: "B" }, { f: 1458, v: "A" }, { f: 1460, v: "C" }, { f: 1463, v: "B" }, { f: 1465, v: "F" }, { f: 1467, v: "C" }, { f: 1469, v: "F" }, { f: 1472, v: "B" }, { f: 1480, v: "A" }, { f: 1483, v: "X" }, { f: 1493, v: "C" }, { f: 1497, v: "B" }, { f: 1499, v: "C" }, { f: 1503, v: "E" }, { f: 1505, v: "F" }, { f: 1509, v: "A" }, { f: 1512, v: "B" }, { f: 1517, v: "C" }, { f: 1524, v: "A" }, { f: 1526, v: "C" }];
export const D8_CUES: Cue[] = [{ f: 1540, v: "X" }, { f: 1543, v: "B" }, { f: 1546, v: "C" }, { f: 1548, v: "A" }, { f: 1550, v: "B" }, { f: 1553, v: "A" }, { f: 1555, v: "E" }, { f: 1558, v: "C" }, { f: 1562, v: "X" }, { f: 1572, v: "B" }, { f: 1575, v: "F" }, { f: 1578, v: "B" }, { f: 1586, v: "A" }, { f: 1588, v: "B" }, { f: 1590, v: "C" }, { f: 1596, v: "A" }, { f: 1600, v: "B" }, { f: 1604, v: "A" }, { f: 1606, v: "B" }];
export const D9_CUES: Cue[] = [{ f: 1688, v: "X" }, { f: 1690, v: "C" }, { f: 1692, v: "B" }, { f: 1701, v: "E" }, { f: 1704, v: "C" }, { f: 1738, v: "B" }, { f: 1741, v: "B" }, { f: 1746, v: "A" }, { f: 1748, v: "C" }, { f: 1755, v: "C" }, { f: 1759, v: "B" }, { f: 1765, v: "H" }, { f: 1769, v: "C" }, { f: 1773, v: "B" }, { f: 1792, v: "C" }, { f: 1797, v: "B" }, { f: 1799, v: "D" }, { f: 1804, v: "C" }, { f: 1807, v: "A" }, { f: 1809, v: "B" }, { f: 1816, v: "A" }, { f: 1818, v: "C" }, { f: 1823, v: "B" }, { f: 1826, v: "C" }, { f: 1828, v: "A" }, { f: 1831, v: "C" }];
export const D10_CUES: Cue[] = [{ f: 2045, v: "D" }, { f: 2070, v: "B" }, { f: 2073, v: "A" }, { f: 2075, v: "C" }, { f: 2078, v: "B" }, { f: 2090, v: "F" }];

/** Bentuk mulut tokoh pada frame f. Di luar jendela dialog -> "X" (mulut diam).
 * 12 frame setelah cue terakhir -> "X" (jaga ekor: mulut tidak nyangkut terbuka). */
export const mouthAt = (cues: Cue[], f: number): Viseme => {
  if (!cues.length) return "X";
  let cur: Viseme = "X";
  for (const c of cues) {
    if (f < c.f) break;
    cur = c.v;
  }
  if (f > cues[cues.length - 1].f + 12) return "X";
  return cur;
};
