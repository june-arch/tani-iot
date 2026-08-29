#!/usr/bin/env python3
# Generate crops.seed.json 62 komoditas Indonesia
import json, pathlib

OUT = pathlib.Path("D:/web/tani-iot/apps/backend/data/crops.seed.json")

# Helper to make guide blocks
def mk(sayur=True):
    pass

crops = []

# Define raw data for each crop: name, slug, category, scientificName, description, iklim, ketinggian, sowing, growing vegetatif+generatif, hydro
# We will programmatically generate with sensible defaults but varied values per commodity.

definitions = [
    # SAYUR 37
    ("Kangkung", "kangkung", "SAYUR", "Ipomoea aquatica", "Sayur air yang tumbuh sangat cepat, favorit hidroponik dan tumis Indonesia.", "Tropis lembap, 25-32°C, curah hujan sedang", "0-800 mdpl", 5, "Rockwool + air", "25-30°C", "70-85%"),
    ("Bayam", "bayam", "SAYUR", "Amaranthus spp.", "Sayuran daun kaya zat besi, panen cepat 25-35 hari.", "Tropis, 25-30°C, sinar penuh", "0-1000 mdpl", 4, "Rockwool / tanah gembur", "24-30°C", "70-80%"),
    ("Sawi Hijau", "sawi-hijau", "SAYUR", "Brassica juncea", "Sawi hijau untuk sup dan tumis, toleran dataran rendah.", "Sejuk-sedang, 22-30°C", "0-1200 mdpl", 7, "Rockwool / cocopeat", "22-28°C", "70-85%"),
    ("Pakcoy", "pakcoy", "SAYUR", "Brassica rapa subsp. chinensis", "Pakcoy renyah, populer untuk hidroponik NFT.", "Sejuk, 18-28°C", "0-1200 mdpl", 10, "Rockwool", "20-28°C", "70-80%"),
    ("Selada", "selada", "SAYUR", "Lactuca sativa", "Selada keriting dan romaine, butuh suhu sejuk agar tidak pahit.", "Sejuk, 18-25°C", "300-1200 mdpl", 10, "Rockwool", "18-24°C", "60-80%"),
    ("Kemangi", "kemangi", "SAYUR", "Ocimum basilicum var. citriodorum", "Kemangi harum untuk lalapan dan pepes, tumbuh mudah.", "Tropis hangat, 24-32°C", "0-700 mdpl", 7, "Tanah + kompos / rockwool", "24-30°C", "65-80%"),
    ("Seledri", "seledri", "SAYUR", "Apium graveolens", "Seledri wangi untuk sup dan jus, pertumbuhan lambat di awal.", "Sejuk, 16-26°C", "200-1200 mdpl", 14, "Rockwool / persemaian nampan", "18-26°C", "70-85%"),
    ("Daun Bawang", "daun-bawang", "SAYUR", "Allium fistulosum", "Daun bawang untuk taburan dan tumis, panen berulang.", "Sejuk-sedang, 20-30°C", "0-1500 mdpl", 12, "Tanah gembur / polybag", "20-28°C", "70-80%"),
    ("Kubis", "kubis", "SAYUR", "Brassica oleracea var. capitata", "Kubis bulat padat, butuh suhu sejuk untuk pembentukan krop.", "Sejuk, 15-25°C", "500-1500 mdpl", 14, "Bedengan semai / nampan", "16-24°C", "75-85%"),
    ("Kembang Kol", "kembang-kol", "SAYUR", "Brassica oleracea var. botrytis", "Kembang kol putih, sensitif panas.", "Sejuk, 15-24°C", "600-1500 mdpl", 14, "Nampan semai + cocopeat", "15-24°C", "75-85%"),
    ("Brokoli", "brokoli", "SAYUR", "Brassica oleracea var. italica", "Brokoli kaya antioksidan, butuh dataran tinggi.", "Sejuk, 15-23°C", "700-1500 mdpl", 12, "Rockwool / nampan", "16-23°C", "70-85%"),
    ("Cabai Rawit", "cabai-rawit", "SAYUR", "Capsicum frutescens", "Cabai rawit pedas, produktif dan tahan virus.", "Tropis panas, 26-32°C", "0-1000 mdpl", 10, "Rockwool / polybag semai", "26-32°C", "70-80%"),
    ("Cabai Keriting", "cabai-keriting", "SAYUR", "Capsicum annuum var. acuminatum", "Cabai keriting untuk sambal dan masakan Padang.", "Tropis, 24-32°C", "0-1200 mdpl", 10, "Rockwool / tray semai", "24-30°C", "70-80%"),
    ("Cabai Besar", "cabai-besar", "SAYUR", "Capsicum annuum", "Cabai besar merah, buah tebal dan kurang pedas.", "Tropis, 24-32°C", "0-1200 mdpl", 10, "Tray semai + cocopeat", "24-30°C", "70-80%"),
    ("Tomat", "tomat", "SAYUR", "Solanum lycopersicum", "Tomat serbaguna untuk sambal, saus, dan jus.", "Sedang, 20-30°C", "0-1500 mdpl", 10, "Rockwool / tray", "20-28°C", "70-80%"),
    ("Terong", "terong", "SAYUR", "Solanum melongena", "Terong ungu panjang dan bulat, tahan panas.", "Tropis panas, 25-32°C", "0-1000 mdpl", 10, "Polybag semai", "25-32°C", "70-80%"),
    ("Timun", "timun", "SAYUR", "Cucumis sativus", "Timun segar untuk lalapan dan acar, merambat.", "Tropis, 25-32°C", "0-1000 mdpl", 5, "Langsung tanam / polybag", "25-32°C", "70-85%"),
    ("Pare", "pare", "SAYUR", "Momordica charantia", "Pare pahit untuk tumis dan jamu, merambat kuat.", "Tropis panas, 25-32°C", "0-800 mdpl", 7, "Polybag / bedengan", "25-32°C", "70-85%"),
    ("Oyong", "oyong", "SAYUR", "Luffa acutangula", "Oyong/gambas untuk sayur bening, merambat.", "Tropis lembap, 25-32°C", "0-800 mdpl", 5, "Langsung tanam", "25-32°C", "70-85%"),
    ("Labu Siam", "labu-siam", "SAYUR", "Sechium edule", "Labu siam untuk lodeh dan tumis, tanaman merambat tahunan.", "Sejuk-sedang, 20-30°C", "300-1500 mdpl", 14, "Buah utuh ditanam miring", "20-28°C", "75-85%"),
    ("Kacang Panjang", "kacang-panjang", "SAYUR", "Vigna unguiculata subsp. sesquipedalis", "Kacang panjang untuk tumis dan pecel.", "Tropis, 25-32°C", "0-800 mdpl", 5, "Langsung tanam di bedengan", "25-32°C", "70-80%"),
    ("Buncis", "buncis", "SAYUR", "Phaseolus vulgaris", "Buncis tegak dan merambat, kaya protein.", "Sejuk-sedang, 20-28°C", "300-1500 mdpl", 5, "Langsung tanam", "20-28°C", "70-80%"),
    ("Bawang Merah", "bawang-merah", "SAYUR", "Allium cepa var. aggregatum", "Bawang merah untuk bumbu dasar, umbi lapis.", "Tropis kering, 25-32°C", "0-800 mdpl", 0, "Umbi langsung tanam", "25-32°C", "60-75%"),
    ("Bawang Putih", "bawang-putih", "SAYUR", "Allium sativum", "Bawang putih butuh suhu sejuk dan hari panjang.", "Sejuk, 18-25°C", "700-1500 mdpl", 0, "Siung langsung tanam", "18-25°C", "60-75%"),
    ("Wortel", "wortel", "SAYUR", "Daucus carota", "Wortel oranye untuk sayur dan jus, umbi akar.", "Sejuk, 16-24°C", "500-1500 mdpl", 0, "Langsung tanam di bedengan gembur", "16-24°C", "70-80%"),
    ("Kentang", "kentang", "SAYUR", "Solanum tuberosum", "Kentang umbi untuk goreng dan sup, butuh dataran tinggi.", "Sejuk, 14-22°C", "800-2000 mdpl", 7, "Umbi ber-tunas / stek", "14-22°C", "75-85%"),
    ("Jahe", "jahe", "SAYUR", "Zingiber officinale", "Jahe rimpang untuk jamu dan bumbu.", "Tropis lembap, 25-32°C, teduh parsial", "0-1200 mdpl", 14, "Rimpang bertunas", "25-30°C", "75-85%"),
    ("Kunyit", "kunyit", "SAYUR", "Curcuma longa", "Kunyit rimpang kuning untuk jamu dan pewarna.", "Tropis lembap, 25-32°C", "0-1000 mdpl", 14, "Rimpang bertunas", "25-30°C", "75-85%"),
    ("Lengkuas", "lengkuas", "SAYUR", "Alpinia galanga", "Lengkuas untuk rendang dan tom yum.", "Tropis lembap, 25-32°C", "0-800 mdpl", 14, "Rimpang bertunas", "25-30°C", "75-85%"),
    ("Serai", "serai", "SAYUR", "Cymbopogon citratus", "Serai wangi untuk soto dan teh.", "Tropis panas, 25-34°C", "0-800 mdpl", 10, "Anakan / stek batang", "25-32°C", "70-80%"),
    ("Jagung Manis", "jagung-manis", "SAYUR", "Zea mays var. saccharata", "Jagung manis untuk rebus dan bakar.", "Tropis, 24-32°C", "0-1200 mdpl", 0, "Langsung tanam benih", "24-32°C", "70-80%"),
    ("Singkong", "singkong", "SAYUR", "Manihot esculenta", "Singkong umbi dan daun untuk gulai.", "Tropis panas, 25-32°C", "0-1000 mdpl", 0, "Stek batang 20cm", "25-32°C", "65-80%"),
    ("Ubi Jalar", "ubi-jalar", "SAYUR", "Ipomoea batatas", "Ubi jalar manis untuk rebus dan keripik.", "Tropis, 22-30°C", "0-1200 mdpl", 7, "Stek pucuk / sulur", "22-30°C", "70-80%"),
    ("Okra", "okra", "SAYUR", "Abelmoschus esculentus", "Okra hijau berlendir untuk tumis.", "Tropis panas, 25-35°C", "0-800 mdpl", 5, "Langsung tanam", "25-32°C", "65-80%"),
    ("Kailan", "kailan", "SAYUR", "Brassica oleracea var. alboglabra", "Kailan untuk cah, mirip sawi tebal.", "Sejuk, 18-28°C", "300-1200 mdpl", 7, "Rockwool / tray", "18-28°C", "70-85%"),
    ("Sawi Putih", "sawi-putih", "SAYUR", "Brassica rapa subsp. pekinensis", "Sawi putih untuk sup dan kimchi.", "Sejuk, 16-26°C", "300-1500 mdpl", 10, "Tray semai", "16-24°C", "75-85%"),
    ("Ketumbar", "ketumbar", "SAYUR", "Coriandrum sativum", "Ketumbar daun dan biji untuk bumbu.", "Sejuk-sedang, 18-28°C", "0-1200 mdpl", 10, "Tabur langsung / rockwool", "18-28°C", "65-80%"),
    # BUAH 25
    ("Melon", "melon", "BUAH", "Cucumis melo", "Melon manis beraroma, butuh sinar penuh dan drainase baik.", "Tropis kering, 25-32°C", "0-800 mdpl", 7, "Polybag semai", "25-32°C", "70-80%"),
    ("Semangka", "semangka", "BUAH", "Citrullus lanatus", "Semangka segar, butuh lahan luas dan sinar penuh.", "Tropis panas, 25-34°C", "0-700 mdpl", 5, "Langsung tanam", "25-34°C", "65-75%"),
    ("Stroberi", "stroberi", "BUAH", "Fragaria × ananassa", "Stroberi manis-asam, butuh dataran tinggi sejuk.", "Sejuk, 15-24°C", "800-1800 mdpl", 14, "Stolon / anakan", "15-22°C", "75-85%"),
    ("Pisang", "pisang", "BUAH", "Musa spp.", "Pisang cavendish/kepok, buah sepanjang tahun.", "Tropis lembap, 26-32°C", "0-1000 mdpl", 14, "Anakan / bonggol", "26-32°C", "75-85%"),
    ("Pepaya", "pepaya", "BUAH", "Carica papaya", "Pepaya california, cepat berbuah 7-9 bulan.", "Tropis, 25-32°C", "0-800 mdpl", 14, "Polybag semai", "25-32°C", "70-80%"),
    ("Jambu Biji", "jambu-biji", "BUAH", "Psidium guajava", "Jambu biji kristal/merah, kaya vitamin C.", "Tropis, 25-32°C", "0-1000 mdpl", 21, "Cangkok / okulasi", "25-32°C", "70-80%"),
    ("Jambu Air", "jambu-air", "BUAH", "Syzygium aqueum", "Jambu air citra/deli, renyah dan berair.", "Tropis lembap, 25-32°C", "0-800 mdpl", 21, "Cangkok", "25-32°C", "75-85%"),
    ("Mangga", "mangga", "BUAH", "Mangifera indica", "Mangga harum manis dan arumanis, raja buah tropis.", "Tropis kering, 26-32°C, musim kering untuk bunga", "0-600 mdpl", 21, "Okulasi / sambung", "26-32°C", "65-75%"),
    ("Nanas", "nanas", "BUAH", "Ananas comosus", "Nanas madu dan cayenne, toleran lahan kering.", "Tropis panas, 24-32°C", "0-800 mdpl", 14, "Mahkota / anakan", "24-32°C", "70-80%"),
    ("Jeruk Manis", "jeruk-manis", "BUAH", "Citrus sinensis", "Jeruk manis untuk jus dan buah meja.", "Tropis-subtropis, 22-32°C", "0-1200 mdpl", 21, "Okulasi", "22-30°C", "70-80%"),
    ("Alpukat", "alpukat", "BUAH", "Persea americana", "Alpukat mentega, lemak sehat tinggi.", "Tropis, 22-30°C", "0-1500 mdpl", 21, "Sambung pucuk", "22-30°C", "70-80%"),
    ("Buah Naga", "buah-naga", "BUAH", "Hylocereus spp.", "Buah naga merah/putih, kaktus merambat.", "Tropis kering, 26-34°C", "0-800 mdpl", 14, "Stek batang", "26-34°C", "60-75%"),
    ("Durian", "durian", "BUAH", "Durio zibethinus", "Durian musang king/montong, raja buah.", "Tropis lembap, 24-32°C", "0-600 mdpl", 30, "Okulasi / sambung", "24-32°C", "75-85%"),
    ("Rambutan", "rambutan", "BUAH", "Nephelium lappaceum", "Rambutan binjai, musiman berbuah lebat.", "Tropis lembap, 25-32°C", "0-600 mdpl", 21, "Okulasi", "25-32°C", "75-85%"),
    ("Manggis", "manggis", "BUAH", "Garcinia mangostana", "Manggis ratu buah, kulit ungu daging putih.", "Tropis lembap, 25-32°C, curah hujan tinggi", "0-800 mdpl", 30, "Biji apomiksis", "25-32°C", "75-85%"),
    ("Duku", "duku", "BUAH", "Lansium parasiticum", "Duku palembang manis, musiman.", "Tropis lembap, 25-32°C", "0-600 mdpl", 30, "Biji / okulasi", "25-32°C", "75-85%"),
    ("Salak", "salak", "BUAH", "Salacca zalacca", "Salak pondoh manis, kulit bersisik.", "Tropis lembap, 24-32°C", "0-800 mdpl", 21, "Biji / anakan", "24-32°C", "75-85%"),
    ("Nangka", "nangka", "BUAH", "Artocarpus heterophyllus", "Nangka madu untuk gudeg dan keripik.", "Tropis, 25-32°C", "0-800 mdpl", 21, "Okulasi", "25-32°C", "70-80%"),
    ("Sirsak", "sirsak", "BUAH", "Annona muricata", "Sirsak untuk jus dan obat herbal.", "Tropis, 25-32°C", "0-800 mdpl", 21, "Biji / okulasi", "25-32°C", "70-80%"),
    ("Markisa", "markisa", "BUAH", "Passiflora edulis", "Markisa asam manis untuk sirup, merambat.", "Tropis-sedang, 20-30°C", "300-1200 mdpl", 14, "Biji / stek", "20-30°C", "70-80%"),
    ("Belimbing", "belimbing", "BUAH", "Averrhoa carambola", "Belimbing manis bentuk bintang.", "Tropis, 25-32°C", "0-700 mdpl", 21, "Cangkok / okulasi", "25-32°C", "70-80%"),
    ("Sawo", "sawo", "BUAH", "Manilkara zapota", "Sawo manila manis legit.", "Tropis panas, 25-34°C", "0-600 mdpl", 30, "Cangkok / okulasi", "25-34°C", "70-80%"),
    ("Kelengkeng", "kelengkeng", "BUAH", "Dimocarpus longan", "Kelengkeng pingpong dan diamond.", "Tropis, 24-32°C", "0-800 mdpl", 21, "Cangkok / okulasi", "24-32°C", "70-80%"),
    ("Blewah", "blewah", "BUAH", "Cucumis melo var. cantalupensis", "Blewah harum untuk es buah.", "Tropis panas, 25-32°C", "0-700 mdpl", 7, "Polybag semai", "25-32°C", "65-75%"),
    ("Anggur", "anggur", "BUAH", "Vitis vinifera", "Anggur tropis untuk jus dan buah meja.", "Tropis kering, 24-32°C, sinar penuh", "0-1000 mdpl", 21, "Stek batang", "24-32°C", "65-75%"),
]

# Templates untuk langkah sowing, pupuk, etc.

def sowing_langkah(name, slug, media, durasi):
    if durasi == 0:
        return [
            f"Siapkan lahan gembur dan buat bedengan lebar 1 m, tinggi 20-30 cm",
            f"Tanam langsung {name.lower()} sesuai jarak tanam anjuran",
            f"Siram hingga lembap dan tutup mulsa jerami tipis",
            f"Jaga kelembapan hingga tunas muncul 3-7 hari",
            f"Jarang dan sulam tanaman yang tidak tumbuh",
        ]
    else:
        return [
            f"Rendam benih {name.lower()} 2-4 jam dalam air hangat",
            f"Siapkan {media.lower()} yang lembap dan steril",
            f"Tabur benih tipis, tutup tipis dengan media, semprot air",
            f"Simpan di tempat teduh 50% naungan, jaga kelembapan",
            f"Pindahkan bibit saat berdaun 2-4 helai setelah {durasi} hari",
        ]

# Growing guides per category
sayur_pupuk_veg = [
    {"nama": "NPK 16-16-16", "takaran": "5 g per liter air", "intervalHari": 7, "cara": "Kocor di sekitar perakaran pagi hari"},
    {"nama": "Pupuk kandang kompos", "takaran": "1 kg per m2", "intervalHari": 14, "cara": "Tabur dan aduk ringan ke tanah"},
]
sayur_pupuk_gen = [
    {"nama": "MKP + KNO3", "takaran": "3 g per liter air", "intervalHari": 7, "cara": "Semprot daun atau kocor sore hari"},
    {"nama": "Pupuk kandang + dolomit", "takaran": "0.5 kg per tanaman", "intervalHari": 21, "cara": "Tabur melingkar di tajuk"},
]
buah_pupuk_veg = [
    {"nama": "NPK 15-15-15 + kompos", "takaran": "100-200 g per tanaman", "intervalHari": 30, "cara": "Benam melingkar di bawah tajuk"},
    {"nama": "Pupuk organik cair", "takaran": "10 ml per liter", "intervalHari": 14, "cara": "Semprot daun pagi hari"},
]
buah_pupuk_gen = [
    {"nama": "KNO3 + Boron", "takaran": "150 g per tanaman", "intervalHari": 30, "cara": "Kocor atau tabur lalu siram"},
    {"nama": "MKP", "takaran": "5 g per liter", "intervalHari": 14, "cara": "Semprot daun saat pembungaan"},
]

hama_sayur = ["Ulat grayak", "Kutu daun", "Thrips", "Layu fusarium"]
hama_buah = ["Lalat buah", "Kutu putih", "Ulat", "Antraknosa"]
hama_sayur_daun = ["Ulat daun", "Kutu daun", "Busuk daun"]

hydro_nutrisi_sayur = ["AB Mix Sayur Daun", "Kalsium nitrat", "Magnesium sulfat"]
hydro_nutrisi_buah = ["AB Mix Buah", "Kalium sulfat", "MKP"]

for idx, (name, slug, cat, sci, desc, iklim, tinggi, durasi, media, suhu, lembab) in enumerate(definitions):
    is_sayur = cat == "SAYUR"
    # customize panen range
    if slug in ["kangkung","bayam","sawi-hijau","pakcoy","selada","kemangi","kailan","sawi-putih","ketumbar"]:
        panen_veg = "20-35 hari"
        panen_gen = "30-45 hari"
        hydro_sistem = "NFT" if slug in ["kangkung","bayam","pakcoy","selada","kailan"] else "Wick"
        ppm = "800-1200" if slug != "selada" else "560-840"
        ph = "5.5-6.5"
        durasi_hydro = 25 if slug != "seledri" else 60
    elif slug in ["tomat","cabai-rawit","cabai-keriting","cabai-besar","terong","timun","pare","oyong","kacang-panjang","buncis"]:
        panen_veg = "30-45 hari"
        panen_gen = "60-90 hari"
        hydro_sistem = "DFT"
        ppm = "1200-1800" if slug.startswith("cabai") or slug=="tomat" else "1000-1400"
        ph = "5.8-6.5"
        durasi_hydro = 75
    elif slug in ["bawang-merah","bawang-putih","wortel","kentang","jahe","kunyit","lengkuas","serai","singkong","ubi-jalar"]:
        panen_veg = "30-60 hari"
        panen_gen = "90-180 hari" if slug in ["jahe","kunyit","lengkuas","kentang","singkong","ubi-jalar"] else "60-75 hari"
        hydro_sistem = "DFT"
        ppm = "1000-1400"
        ph = "5.5-6.5"
        durasi_hydro = 90 if slug in ["jahe","kunyit","kentang"] else 60
    elif cat == "BUAH" and slug in ["melon","semangka","blewah","stroberi"]:
        panen_veg = "20-30 hari"
        panen_gen = "65-85 hari" if slug != "stroberi" else "60-90 hari"
        hydro_sistem = "DFT"
        ppm = "1200-1600" if slug != "stroberi" else "800-1200"
        ph = "5.8-6.5" if slug != "stroberi" else "5.5-6.2"
        durasi_hydro = 75 if slug != "stroberi" else 90
    else: # buah tahunan
        panen_veg = "90-180 hari"
        panen_gen = "180-365 hari" if slug in ["mangga","durian","manggis","duku","alpukat"] else "120-240 hari"
        hydro_sistem = "NFT"  # mostly not hydro but we provide guide
        ppm = "1000-1400"
        ph = "5.5-6.5"
        durasi_hydro = 120

    # Sowing guide fix for umbi/rimpang where durasi 0 -> siapTanamIndikator berbeda
    if durasi == 0:
        siap = "Benih tumbuh tunas 2-3 cm, akar serabut terlihat"
        if slug in ["bawang-merah","bawang-putih"]:
            siap = "Siung bertunas 1-2 cm, akar mulai keluar"
        elif slug in ["wortel","jagung-manis","singkong","kacang-panjang","buncis","timun","semangka","oyong"]:
            siap = "Benih berkecambah 3-5 hari, siap dijarangkan"
    else:
        siap = f"Bibit berdaun 2-4 helai sejati, tinggi 5-10 cm, akar putih sehat setelah {durasi} hari"

    # langkah
    langkah = sowing_langkah(name, slug, media, durasi if durasi!=0 else 5)
    # Hama pilih
    if is_sayur and slug in ["kangkung","bayam","sawi-hijau","pakcoy","selada","kemangi","seledri","kailan","sawi-putih","kubis","kembang-kol","brokoli"]:
        hama_veg = ["Ulat daun", "Kutu daun", "Busuk daun"]
        hama_gen = ["Ulat grayak", "Busuk lunak", "Kutu kebul"]
    elif is_sayur:
        hama_veg = hama_sayur
        hama_gen = ["Layu bakteri", "Thrips", "Kutu daun"]
    else:
        hama_veg = hama_buah[:3]
        hama_gen = hama_buah

    penyiraman_veg = "Siram 1-2 kali sehari pagi dan sore, jaga tanah lembap tidak becek" if is_sayur else "Siram 2-3 hari sekali, jaga drainase baik"
    penyiraman_gen = "Siram rutin, kurangi saat pembungaan untuk buah; mulsa jerami untuk jaga kelembapan" if not is_sayur else "Siram teratur, hindari genangan di pangkal batang"

    entry = {
        "name": name,
        "slug": slug,
        "category": cat,
        "scientificName": sci,
        "description": desc,
        "iklimOptimal": iklim,
        "ketinggianOptimal": tinggi,
        "imageUrl": None,
        "sowingGuide": {
            "mediaTanam": media,
            "durasiHari": durasi if durasi!=0 else 5,
            "suhuOptimal": suhu,
            "kelembaban": lembab,
            "langkah": langkah,
            "siapTanamIndikator": siap
        },
        "growingGuides": [
            {
                "fase": "VEGETATIF",
                "pupuk": buah_pupuk_veg if not is_sayur else sayur_pupuk_veg,
                "penyiraman": penyiraman_veg,
                "hama": hama_veg,
                "panenHariRange": panen_veg
            },
            {
                "fase": "GENERATIF",
                "pupuk": buah_pupuk_gen if not is_sayur else sayur_pupuk_gen,
                "penyiraman": penyiraman_gen,
                "hama": hama_gen,
                "panenHariRange": panen_gen
            }
        ],
        "hydroponicGuide": {
            "sistem": hydro_sistem,
            "ppmRange": ppm,
            "phRange": ph,
            "nutrisi": hydro_nutrisi_sayur if is_sayur else hydro_nutrisi_buah,
            "durasiHari": durasi_hydro
        }
    }
    # override durasiHari for sowing where original 0 -> keep 0? but schema expects Int, we keep 0 for direct planting to be explicit
    if durasi == 0:
        entry["sowingGuide"]["durasiHari"] = 5 if slug not in ["bawang-merah","bawang-putih","wortel","singkong","jagung-manis"] else (7 if slug=="wortel" else 0)
        # keep 0 for umbi, but valid
        if slug in ["bawang-merah","bawang-putih","wor","kentang"]: pass

    crops.append(entry)

# Fix specific durasi 0 crops to keep 0 where appropriate
for c in crops:
    if c["slug"] in ["bawang-merah","bawang-putih","wortel","singkong","jagung-manis","kentang"]:
        # for these, durasi semai = 0 (langsung tanam)
        if c["slug"] in ["bawang-merah","bawang-putih"]:
            c["sowingGuide"]["durasiHari"] = 0
            c["sowingGuide"]["mediaTanam"] = "Tanah gembur berpasir + kompos" if c["slug"]=="bawang-merah" else "Tanah gembur + dolomit"
        elif c["slug"]=="wortel":
            c["sowingGuide"]["durasiHari"] = 0
        elif c["slug"]=="singkong":
            c["sowingGuide"]["durasiHari"] = 0
        elif c["slug"]=="jagung-manis":
            c["sowingGuide"]["durasiHari"] = 0
        elif c["slug"]=="kentang":
            c["sowingGuide"]["durasiHari"] = 7

OUT.write_text(json.dumps(crops, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Generated {len(crops)} crops -> {OUT}")
# verify counts
from collections import Counter
cnt = Counter(c["category"] for c in crops)
print(cnt)
# sample
for c in crops[:3]:
    print(c["slug"], c["category"])
