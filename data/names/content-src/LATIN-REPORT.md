# Latin spellings report

Built by `scripts/names-content/build-latin.mjs`. 1746 of 1937 deck names have an Academy spelling; 226 also have an international form.

## How the Academy spelling is made

The rules of the Academy of the Hebrew Language for transliteration, simplified version: no diacritics, no mark for א or ע, no doubled letters. The script reads the card's niqqud, so a dagesh decides b/v, k/kh and p/f. A shva is written as e only where modern Hebrew says it (at the start before י ל מ נ ר, before א ה ע, or when the two consonants can't start a syllable). Exceptions are in `latin-overrides.json`, each with a reason.

## International forms

From the hand-made `latin-international.json`: `bible` forms are the English (King James) Bible form, checked against the KJV text; `borrowed:<lang>` forms are the spelling in the language the name came from. Forms equal to the Academy spelling are not shown:

אריאל, ליאם, אוריאל, אליעזר, אלישע, נח, בועז, עזרא, אוליבר, עמוס, סמואל, הגר, אולגה, ג'ואל, נובה, בנגמין

## Overrides

- מרדכי → Mordekhai: The hataf kamats under ד is said e (Mordekhai).
- יששכר → Yisakhar: The second ש is not said.
- קטרין → Katrin: Borrowed name said with a, not a kamats katan.
- קתרין → Katrin: Borrowed name said with a, not a kamats katan.
- טשארנא → Tsharna: טש is one sound here; no vowel between them.
- אושן → Oshen: Borrowed (Ocean): the last syllable is said with e.
- מייקל → Maikel: Borrowed (Michael, English): said Maikel.

## No spelling (191 names without vowel points)

The rules can't read a name without niqqud, so these show no Academy spelling until their niqqud is written:

אלין, אנאל, אליאן, ענהאל, אלארי, היילי, אריאן, מיילי, ריין, אליאנה, הענא, פראדל, לאיה, לואן, ענאל, איילין, מירן, טאי, עטיל, עלקא, ניבר, ליהיא, סיאל, עטל, הני, אוולין, עיינה, אילעי, גוליה, לאיו, פרומט, אילעאי, לוריאן, לימאי, נסלי, פעסיל, קוה, היאלי, גאלדא, אלבי, מאטיל, רעכיל, לינס, מאטל, תאיה, אלאיה, לנואל, בראנדל, מליא, פעריל, אומה, ריאל, אלני, ליו, פראדי, מוסיא, זאן, שיילי, אודאל, טילא, פעשא, בלן, מל, באשא, פארי, מאודי, פאי, טמסגן, שיין, עדאל, רנאל, קילא, מאל, בנאל, פערי, נואה, ראי, ניסל, סערל, אלדנה, נסה, ג'יה, להיה, הלה, מידן, הילאי, גאל, מריאל, מורל, לטם, עטר, שנאל, אולה, מוראל, אילאיל, ילין, אנני, אלית, יראת, גאן, ליקה, אספה, אוראן, בוני, פסי, ליפא, אוניל, תניא, מושית, יטל, מגלי, יוראי, מאלי, עטיא, תיקי, גיה, מקונן, טאיה, גאלה, דוברת, בנו, ניה, הלי, שפי, ראות, גרמי, דדי, ראדא, אימי, מלה, לליב, סנאית, אגת, בירן, תאה, מאילי, טרויה, יוהד, נואית, פרידי, מרית, אתאל, אושיק, שיריי, אלקיים, מישר, עדילי, הילור, לריאן, לאוני, טילי, סייפן, אלינוער, ליטן, אליי, עלינה, ויק, גוי, גונתן, קידר, רומיאל, אסתאר, אזב, גיין, מיקלה, רודד, אלישב, גרנית, איגי, אגי, נאית, אלאמר, יורית, אנאניה, אבטמו, מירז, ניו, אחישי, לינאי, אדיה, פולג, מיו, הגרה, תשובה, אביאת, פטמה, אביאב, נוילי, דיאה, אפקה, רואית

## All spellings

| Name | Academy | International |
| --- | --- | --- |
| אריאל | Ariel |  |
| יוסף | Yosef | Joseph |
| אורי | Uri |  |
| דוד | David |  |
| לביא | Lavi |  |
| אביגיל | Avigayil | Abigail |
| עומר | Omer |  |
| איילה | Ayala |  |
| רפאל | Refael |  |
| אדם | Adam |  |
| מרים | Miryam | Miriam |
| ארי | Ari |  |
| שרה | Sara | Sarah |
| אליה | Eliya |  |
| משה | Moshe | Moses |
| נועם | Noam |  |
| יהודה | Yehuda | Judah |
| מאיה | Maya |  |
| תמר | Tamar |  |
| אברהם | Avraham | Abraham |
| אסתר | Ester | Esther |
| ישראל | Yisrael |  |
| איתן | Eitan |  |
| דניאל | Daniyel | Daniel |
| ליבי | Libi |  |
| יעל | Yael |  |
| נועה | Noa |  |
| מיכאל | Mikhael | Michael |
| יהונתן | Yehonatan | Jonathan |
| חנה | Hana | Hannah |
| הלל | Hilel |  |
| יעקב | Yaakov | Jacob |
| ליה | Liya |  |
| שמעון | Shimon | Simeon |
| יצחק | Yitshak | Isaac |
| אוריה | Uriya |  |
| שמואל | Shmuel | Samuel |
| אלה | Ela |  |
| חיה | Haya |  |
| אדל | Adel |  |
| אימרי | Imri |  |
| איתי | Itai |  |
| גפן | Gefen |  |
| חיים | Hayim |  |
| רבקה | Rivka | Rebekah |
| רחל | Rahel | Rachel |
| אהרון | Aharon | Aaron |
| עלמה | Alma |  |
| שלמה | Shlomo | Solomon |
| טליה | Talya |  |
| נאיה | Naya |  |
| אור | Or |  |
| רות | Rut | Ruth |
| שירה | Shira |  |
| יונתן | Yonatan | Jonathan |
| מיכל | Mikhal | Michal |
| נויה | Noya |  |
| יהלי | Yahali |  |
| גאיה | Gaya |  |
| ארבל | Arbel |  |
| נטע | Neta |  |
| מאיר | Meir |  |
| נעמי | Naomi |  |
| רוני | Roni |  |
| לאה | Lea | Leah |
| יאיר | Yair |  |
| ליאם | Liam |  |
| מרדכי | Mordekhai | Mordecai |
| ליאן | Layan |  |
| הודיה | Hodaya |  |
| מלכה | Malka |  |
| רומי | Romi |  |
| אביב | Aviv |  |
| בנימין | Binyamin | Benjamin |
| אליהו | Eliyahu | Elijah |
| עמנואל | Imanuel | Emmanuel |
| אמה | Ema | Emma |
| יובל | Yuval |  |
| מנחם | Menahem |  |
| איתמר | Itamar |  |
| שחר | Shahar |  |
| אגם | Agam |  |
| ישי | Yishai | Jesse |
| נגה | Nogah |  |
| ריף | Rif |  |
| יהודית | Yehudit |  |
| הדסה | Hadasa | Hadassah |
| בניה | Bnaya |  |
| עידו | Ido |  |
| אלמה | Alma |  |
| מיאל | Miel |  |
| תהילה | Tehila |  |
| שילה | Shilo |  |
| מעיין | Mayan |  |
| הראל | Harel |  |
| עמית | Amit |  |
| עילאי | Ilai |  |
| אמיר | Amir |  |
| ליב | Liv |  |
| אלישבע | Elisheva |  |
| רום | Rom |  |
| לין | Lin |  |
| אבישג | Avishag |  |
| שקד | Shaked |  |
| עדי | Adi |  |
| נתנאל | Netanel | Nathanael |
| אפרת | Efrat |  |
| נבו | Nevo |  |
| נוה | Nave |  |
| רני | Rani |  |
| טוהר | Tohar |  |
| לני | Leni |  |
| דבורה | Dvora | Deborah |
| נתן | Natan | Nathan |
| ניב | Niv |  |
| שי | Shai |  |
| שי-לי | Shai-Li |  |
| הללי | Haleli |  |
| אלון | Alon |  |
| עדן | Eden |  |
| ינאי | Yanai |  |
| ניתאי | Nitai |  |
| כרם | Kerem |  |
| נעמה | Naama |  |
| עוז | Oz |  |
| צבי | Tsvi |  |
| הדר | Hadar |  |
| בן | Ben |  |
| הילה | Hila |  |
| נהוראי | Nehorai |  |
| בר | Bar |  |
| ראם | Reem |  |
| גיא | Gai |  |
| דור | Dor |  |
| מאור | Maor |  |
| אלי | Eli |  |
| זיו | Ziv |  |
| אריאה | Arya |  |
| הדס | Hadas |  |
| גבריאל | Gavriel | Gabriel |
| כרמל | Karmel |  |
| מלאכי | Malakhi | Malachi |
| אמילי | Emili | Emily |
| אוריאל | Uriel |  |
| נריה | Neriya |  |
| תהל | Tehel |  |
| אריה | Arye |  |
| ים | Yam |  |
| שלום | Shalom |  |
| נחמה | Nehama |  |
| מאורי | Meori |  |
| עופרי | Ofri |  |
| ברכה | Brakha |  |
| אביטל | Avital |  |
| מריה | Marya |  |
| יהושע | Yehoshua | Joshua |
| ידידיה | Yedidya |  |
| אלחנן | Elhanan |  |
| צפורה | Tsipora | Zipporah |
| מיקה | Mika |  |
| רועי | Roi |  |
| נחמן | Nahman |  |
| יגל | Yagel |  |
| תום | Tom |  |
| אופיר | Ofir |  |
| אן | An | Anne |
| ניל | Nil |  |
| רון | Ron |  |
| דן | Dan |  |
| יסכה | Yiska |  |
| עומרי | Omri |  |
| יהב | Yahav |  |
| שוהם | Shoham |  |
| אביה | Aviya |  |
| יאר | Yaer |  |
| ירדן | Yarden |  |
| לוי | Levi |  |
| ליאו | Leo |  |
| עברי | Ivri |  |
| אביתר | Evyatar |  |
| זוהר | Zohar |  |
| ליבא | Liba |  |
| חוה | Hava | Eve |
| שייה | Shaya |  |
| סול | Sol |  |
| אודיה | Odya |  |
| כפיר | Kfir |  |
| ליאל | Liel |  |
| שולמית | Shulamit |  |
| סהר | Sahar |  |
| עידן | Idan |  |
| אביאל | Aviel |  |
| שיר | Shir |  |
| מילה | Mila |  |
| שושנה | Shoshana |  |
| רותם | Rotem |  |
| אליעזר | Eliezer |  |
| איה | Aya |  |
| דין | Din |  |
| פנחס | Pinhas |  |
| שיינא | Sheina |  |
| רוי | Roi |  |
| יסמין | Yasmin |  |
| אמיליה | Emilya | Emilia |
| מוריה | Moriya |  |
| יולי | Yuli |  |
| אלרואי | Elroi |  |
| כרמי | Karmi |  |
| הלני | Heleni |  |
| נדב | Nadav |  |
| גלי | Gali |  |
| ברוך | Barukh |  |
| גל | Gal |  |
| שמחה | Simha |  |
| נפתלי | Naftali | Naphtali |
| פלג | Peleg |  |
| בתיה | Bitya |  |
| סאן | San |  |
| טל | Tal |  |
| אמונה | Emuna |  |
| אלעזר | Elazar |  |
| מילאן | Milan |  |
| ריי | Rei | Ray |
| יחיאל | Yehiel |  |
| אליאב | Eliav |  |
| פיגא | Feiga |  |
| עמיחי | Amihai |  |
| הילי | Hili |  |
| ליאור | Lior |  |
| רז | Raz |  |
| דביר | Dvir |  |
| יהל | Yahel |  |
| גילי | Gili |  |
| אשר | Asher |  |
| עקיבא | Akiva |  |
| אפרים | Efrayim | Ephraim |
| אמיתי | Amitai |  |
| ינון | Yinon |  |
| אדר | Adar |  |
| מיכאלה | Mikhaela |  |
| אופק | Ofek |  |
| גיטל | Gitl |  |
| דריה | Darya |  |
| אלימלך | Elimelekh |  |
| בת שבע | Bat Sheva |  |
| שילת | Shilat |  |
| שני | Shani |  |
| מאי | Mai |  |
| קדם | Kedem |  |
| תאיר | Tair |  |
| נילי | Nili |  |
| שניאור | Shneor |  |
| עז | Oz |  |
| תומר | Tomer |  |
| יוכבד | Yokheved |  |
| עמליה | Amalya |  |
| פאר | Peer |  |
| ורד | Vered |  |
| אושר | Osher |  |
| אייר | Iyar |  |
| ניצן | Nitsan |  |
| יחזקאל | Yehezkel | Ezekiel |
| ארז | Erez |  |
| עתי | Iti |  |
| דרור | Dror |  |
| בארי | Beeri |  |
| שיה | Shaya |  |
| אורה | Ora |  |
| רעי | Rei |  |
| בלומה | Bluma |  |
| אייל | Ayal |  |
| אמי | Ami |  |
| יואב | Yoav |  |
| מתן | Matan |  |
| אוריאן | Orian |  |
| רונה | Rona |  |
| דניאלה | Daniyela |  |
| יואל | Yoel | Joel |
| תבל | Tevel |  |
| טובה | Tova |  |
| הינדא | Hinda |  |
| יערה | Yara |  |
| תבור | Tavor |  |
| אבישי | Avishai |  |
| שון | Shon | Sean |
| ארין | Erin |  |
| נגב | Negev |  |
| אחיה | Ahiya |  |
| אמרי | Imri |  |
| ירין | Yarin |  |
| טומי | Tomi |  |
| לילה | Laila |  |
| רוז | Roz | Rose |
| אליענה | Eliana |  |
| איימי | Eimi | Amy |
| אסיף | Asif |  |
| סופיה | Sofiya | Sophia |
| זאב | Zeev |  |
| איב | Iv | Eve |
| סימה | Sima |  |
| עדינה | Adina |  |
| הילל | Heilel |  |
| אסף | Asaf |  |
| גוני | Goni |  |
| ארייה | Arye |  |
| פנינה | Pnina |  |
| דב | Dov |  |
| אוראל | Orel |  |
| צופיה | Tsofiya |  |
| ישעיה | Yeshaya |  |
| דני | Dani |  |
| שפרה | Shifra |  |
| טום | Tom |  |
| מנור | Manor |  |
| אודל | Odel |  |
| בת | Bat |  |
| מרום | Marom |  |
| אלמוג | Almog |  |
| דורי | Dori |  |
| יפה | Yafa |  |
| יאן | Yan |  |
| רנה | Rina |  |
| סיני | Sinai |  |
| רואי | Roi |  |
| אורין | Orin |  |
| איליי | Ilai |  |
| איילת | Ayelet |  |
| יותם | Yotam |  |
| רננה | Renana |  |
| גיל | Gil |  |
| אדיר | Adir |  |
| אלאור | Elor |  |
| עילי | Ili |  |
| עדיה | Adaya |  |
| נרי | Neri |  |
| ראובן | Reuven | Reuben |
| דינה | Dina | Dinah |
| שיראל | Shirel |  |
| אלונה | Alona |  |
| שיינדל | Sheindl |  |
| ברי | Bri |  |
| יוטא | Yuta |  |
| ענר | Aner |  |
| קאי | Kai |  |
| אילן | Ilan |  |
| עטרה | Atara |  |
| תפארת | Tiferet |  |
| אהובה | Ahuva |  |
| אלישע | Elisha |  |
| ניר | Nir |  |
| צור | Tsur |  |
| פערל | Perl |  |
| רינה | Rina |  |
| תמרה | Tamara |  |
| לורן | Loren | Lauren |
| משי | Meshi |  |
| מייה | Maya |  |
| אורן | Oren |  |
| שליו | Slav |  |
| עדיאל | Adiel |  |
| ענבר | Inbar |  |
| שלו | Shalev |  |
| צביה | Tsivya |  |
| לילי | Lili | Lily |
| פריאל | Priel |  |
| אלקנה | Elkana |  |
| אחינועם | Ahinoam |  |
| בילא | Bila |  |
| אמור | Amor |  |
| נח | Noah |  |
| בראל | Barel |  |
| נינה | Nina |  |
| אראל | Erel |  |
| אלומה | Aluma |  |
| און | On |  |
| לב | Lev |  |
| מילי | Mili |  |
| נורי | Nuri |  |
| מבשר | Mevaser |  |
| אלכס | Aleks | Alex |
| לייה | Laya |  |
| לוריא | Lurya |  |
| דורון | Doron |  |
| קורן | Koren |  |
| לירי | Liri |  |
| גילה | Gila |  |
| אושרי | Oshri |  |
| ליליאן | Lilian | Lillian |
| יעלה | Yaala |  |
| ליאה | Lia |  |
| רעות | Reut |  |
| בועז | Boaz |  |
| נחום | Nahum |  |
| אליאור | Elior |  |
| אלרועי | Elroi |  |
| יפתח | Yiftah |  |
| לוטם | Lotem |  |
| רייזל | Reizl |  |
| מנוחה | Menuha |  |
| מטר | Matar |  |
| יונה | Yona | Jonah |
| אילון | Eilon |  |
| בצלאל | Betsalel |  |
| דולב | Dulev |  |
| לירוי | Leiroi |  |
| זואי | Zoi | Zoe |
| גור | Gur |  |
| תגל | Tagel |  |
| לינוי | Linoi |  |
| רובי | Rubi |  |
| נסיה | Nisya |  |
| מישל | Mishel | Michelle |
| אלינור | Elinor |  |
| ליאב | Liav |  |
| לאו | Leo |  |
| ברק | Barak |  |
| אילת | Eilat |  |
| דר | Dar |  |
| גולן | Golan |  |
| גולדה | Golda |  |
| נלי | Neli |  |
| עובדיה | Ovadya | Obadiah |
| דילן | Dilan | Dylan |
| טוביה | Toviya |  |
| איטה | Ita |  |
| גבע | Geva |  |
| קרני | Karni |  |
| גלעד | Gilad |  |
| סתיו | Stav |  |
| ליעד | Liad |  |
| שיאל | Shaiel |  |
| לאל | Lael |  |
| עזרא | Ezra |  |
| רם | Ram |  |
| אסיה | Asya |  |
| יער | Yaar |  |
| פלא | Pele |  |
| רוחמה | Ruhama |  |
| ירחמיאל | Yerahmel |  |
| אווה | Eva |  |
| ג'וליה | Julya | Julia |
| פריידא | Freida |  |
| הוד | Hod |  |
| אלישיב | Elyashiv |  |
| חושן | Hoshen |  |
| צורי | Tsuri |  |
| שמריהו | Shmaryahu |  |
| חן | Hen |  |
| נוי | Noi |  |
| סאלי | Sali |  |
| ליעם | Liam |  |
| אוליביה | Olivya | Olivia |
| איידל | Eidl |  |
| ראשית | Reshit |  |
| אנה | Ana |  |
| איתיאל | Itiel |  |
| יוחנן | Yohanan |  |
| יששכר | Yisakhar | Issachar |
| בניהו | Bnayahu |  |
| אשירה | Ashira |  |
| שאול | Shaul | Saul |
| ליהי | Lihi |  |
| כליל | Klil |  |
| אליאל | Eliel |  |
| לונה | Luna |  |
| אלרום | Elrom |  |
| תיאו | Teo | Theo |
| נאוה | Nava |  |
| לי | Li |  |
| חגי | Hagai |  |
| אליס | Alis | Alice |
| רזיאל | Raziel |  |
| ארד | Arad |  |
| אל | El |  |
| סימא | Sima |  |
| תכלת | Tekhelet |  |
| אביר | Abir |  |
| ליבר | Liber |  |
| חנוך | Hanokh | Enoch |
| שחרי | Shahari |  |
| חגית | Hagit |  |
| שגיא | Sagi |  |
| מעוז | Maoz |  |
| פסיה | Pesya |  |
| קשת | Keshet |  |
| אביחי | Avihai |  |
| מלי | Mali |  |
| מיתר | Meitar |  |
| ישעיהו | Yeshayahu | Isaiah |
| אבינועם | Avinoam |  |
| דקל | Dekel |  |
| הניה | Hanya |  |
| מיי | Mei | May |
| רן | Ran |  |
| אודליה | Odalya |  |
| אדוה | Adva |  |
| יוחאי | Yohai |  |
| שמשון | Shimshon | Samson |
| עזריאל | Azriel |  |
| אלנתן | Elnatan |  |
| איילת השחר | Ayelet Hashahar |  |
| אלעאי | Ilai |  |
| מיליה | Milya |  |
| נחמיה | Nehemya | Nehemiah |
| טויבא | Toiba |  |
| דנה | Dana |  |
| טלי | Tali |  |
| ליאנה | Liana |  |
| אפק | Afek |  |
| ישכר | Yisakhar |  |
| בלה | Bela |  |
| מתניה | Matanya |  |
| שרגא | Shraga |  |
| תהלה | Tehila |  |
| מירל | Mirl |  |
| מורי | Mori |  |
| קמה | Kama |  |
| תומאס | Tomas | Thomas |
| אלכסנדר | Aleksander | Alexander |
| ספיר | Sapir |  |
| שירי | Shiri |  |
| נאור | Naor |  |
| אפיק | Afik |  |
| אמלי | Emeli |  |
| גיטי | Giti |  |
| שובי | Shuvi |  |
| גרשון | Gershon |  |
| אביגדור | Avigdor |  |
| תאי | Tai |  |
| ניסים | Nisim |  |
| ציון | Tsiyon | Zion |
| לירן | Liran |  |
| ליאון | Leon |  |
| חרות | Herut |  |
| שילי | Shili |  |
| סאני | Sani |  |
| תיאה | Tea |  |
| מיאור | Mior |  |
| אוהד | Ohad |  |
| אביעד | Aviad |  |
| מינה | Mina |  |
| אביאור | Avior |  |
| לשם | Leshem |  |
| אוליבר | Oliver |  |
| שי-אל | Shai-El |  |
| באר | Beer |  |
| תמיר | Tamir |  |
| גליה | Galya |  |
| שחף | Shahaf |  |
| רביד | Ravid |  |
| לורין | Lorin |  |
| מתנאל | Matanel |  |
| דגן | Dagan |  |
| דוריה | Doriya |  |
| עופר | Ofer |  |
| דיאנה | Diana |  |
| אריאלה | Ariela |  |
| גד | Gad |  |
| קים | Kim |  |
| פרומה | Fruma |  |
| סוף | Suf |  |
| טוב | Tov |  |
| לאור | Laor |  |
| יקיר | Yakir |  |
| מייקל | Maikel | Michael |
| הילני | Heleni |  |
| אילנה | Ilana |  |
| עליזה | Aliza |  |
| שלי | Sheli |  |
| רעיה | Raya |  |
| מנדל | Mendl |  |
| לישי | Lishai |  |
| איתם | Eitam |  |
| שטערנא | Shterna |  |
| אסא | Asa |  |
| פרידא | Frida |  |
| ארגמן | Argaman |  |
| לירון | Liron |  |
| מור | Mor |  |
| מרגלית | Margalit |  |
| מנשה | Menashe | Manasseh |
| עמרם | Amram |  |
| מתתיהו | Matityahu |  |
| יקותיאל | Yekutiel |  |
| טהר | Tohar |  |
| פסח | Pesah |  |
| לורי | Lori |  |
| מינדל | Mindl |  |
| פייגי | Feigi |  |
| אלתר | Alter |  |
| ריו | Rio |  |
| שבות | Shvut |  |
| מלודי | Melodi | Melody |
| טנא | Tene |  |
| זהבה | Zehava |  |
| ליאורה | Liora |  |
| אסנת | Osnat |  |
| שגב | Segev |  |
| אלדר | Eldar |  |
| זכריה | Zkharya | Zechariah |
| אליסף | Elyasaf |  |
| טובי | Tovi |  |
| ליר | Lir |  |
| תחיה | Tehiya |  |
| אלינוי | Elinoi |  |
| שיינה | Sheina |  |
| מושקא | Mushka |  |
| אריאנה | Ariana |  |
| תמה | Tama |  |
| לביאה | Levia |  |
| קיילא | Keila |  |
| נחל | Nahal |  |
| נטלי | Natali | Natalie |
| מרק | Mark |  |
| גדעון | Gidon | Gideon |
| גאולה | Geula |  |
| גבריאלה | Gavriela |  |
| אמיל | Emil |  |
| חנניה | Hananya |  |
| פז | Paz |  |
| אילי | Eili |  |
| חננאל | Hananel |  |
| זלמן | Zalman |  |
| עמיאל | Amiel |  |
| אנדי | Andi | Andy |
| שריי | Sarai |  |
| נצר | Netser |  |
| אשחר | Ashaher |  |
| אולי | Oli |  |
| לידור | Lidor |  |
| יוני | Yoni |  |
| אלירז | Eliraz |  |
| נוריאל | Nuriel |  |
| רימון | Rimon |  |
| נעומי | Naomi |  |
| צוף | Tsuf |  |
| זיסל | Zisl |  |
| מלאני | Melani | Melanie |
| ליבה | Liba |  |
| דון | Don |  |
| אשל | Eshel |  |
| נירי | Niri |  |
| מתאו | Mateo |  |
| אלעד | Elad |  |
| אורית | Orit |  |
| אורלי | Orli |  |
| דליה | Dalya |  |
| יגאל | Yigal |  |
| חדוה | Hedva |  |
| להב | Lahav |  |
| משולם | Meshulam |  |
| עשהאל | Asahel |  |
| תומי | Tomi |  |
| אילור | Ilor |  |
| ריילי | Reili | Riley |
| אביבה | Aviva |  |
| עמוס | Amos |  |
| אריק | Erik | Eric |
| רחלי | Raheli |  |
| לאון | Leon |  |
| אליסה | Elisa |  |
| מוריאל | Moriel |  |
| מירון | Meiron |  |
| אלטע | Alte |  |
| בל | Bel |  |
| גון | Gon |  |
| אלטר | Alter |  |
| נוהר | Nohar |  |
| נצח | Netsah |  |
| יענטא | Yenta |  |
| גומא | Gome |  |
| ליטל | Lital |  |
| יורם | Yoram |  |
| מירי | Miri |  |
| יוגב | Yogev |  |
| חי | Hai |  |
| מאירה | Meira |  |
| אליעד | Eliad |  |
| טלאור | Talor |  |
| דיאן | Dian |  |
| אלחי | Elhai |  |
| עיליי | Ilai |  |
| אליקים | Elyakim |  |
| גולדי | Goldi |  |
| נהורה | Nehora |  |
| אלרוי | Elroi |  |
| אהבה | Ahava |  |
| שובה | Shuva |  |
| ירון | Yaron |  |
| אבנר | Avner | Abner |
| סער | Saar |  |
| מריאנה | Maryana |  |
| שרי | Sarai |  |
| ניסן | Nisan |  |
| צילה | Tsila |  |
| ברוריה | Brurya |  |
| חביבה | Haviva |  |
| סמואל | Samuel |  |
| סלין | Selin | Celine |
| גדליה | Gedalya |  |
| מילכה | Milka |  |
| צירל | Tsirl |  |
| קירה | Kira |  |
| פורת | Porat |  |
| רייזי | Reizi |  |
| ראיין | Rayan |  |
| יערי | Yaari |  |
| בילי | Bili |  |
| עטי | Ati |  |
| ישעי | Yishi |  |
| אלאורי | Elori |  |
| קרן | Keren |  |
| מירב | Merav |  |
| קורל | Koral |  |
| שניר | Snir |  |
| חני | Hani |  |
| הלן | Helen |  |
| אבשלום | Avshalom | Absalom |
| דותן | Dotan |  |
| תרצה | Tirtsa |  |
| בתאל | Batel |  |
| עוזיאל | Uziel |  |
| רונאל | Ronel |  |
| מליסה | Melisa | Melissa |
| לידר | Lider |  |
| שלהבת | Shalhevet |  |
| דוראל | Dorel |  |
| ערבה | Arava |  |
| תלמה | Talma |  |
| יהלום | Yahalom |  |
| מנדי | Mendi |  |
| שבע | Sheva |  |
| איטא | Ita |  |
| נהר | Nahar |  |
| עמיעד | Amiad |  |
| שינא | Sheina |  |
| נס | Nes |  |
| עיטם | Eitam |  |
| שילו | Shilo |  |
| שלם | Shalem |  |
| טבע | Teva |  |
| כנה | Kana |  |
| אליאם | Eliam |  |
| מזל | Mazal |  |
| ערן | Eran |  |
| דפנה | Dafna |  |
| ורדה | Varda |  |
| אליזבט | Elizabet | Elizabeth |
| ריקי | Riki | Ricky |
| מיכה | Mikha | Micah |
| אסתי | Esti |  |
| זוהרה | Zuhra |  |
| עטרת | Ateret |  |
| דיויד | Deivid |  |
| נחשון | Nahshon |  |
| אמליה | Amalya |  |
| בת ציון | Bat Tsiyon |  |
| קינן | Keinan |  |
| רווה | Rave |  |
| שינדל | Sheindl |  |
| הארי | Hari | Harry |
| לוקה | Luka | Luca |
| דיה | Daya |  |
| מבשרת | Mevaseret |  |
| עדין | Adin |  |
| בתשבע | Batsheva |  |
| תור | Tor |  |
| דבש | Dvash |  |
| אמן | Amen |  |
| לוקא | Luka | Luca |
| רועה | Roe |  |
| טשארנא | Tsharna |  |
| מפל | Mapal |  |
| שרית | Sarit |  |
| לילך | Lilakh |  |
| שירלי | Shirli | Shirley |
| אהוד | Ehud |  |
| בת אל | Bat El |  |
| יפית | Yafit |  |
| אלכסנדרה | Aleksandra | Alexandra |
| אורון | Oron |  |
| מקס | Maks | Max |
| אדריאן | Adrian |  |
| מישאל | Mishael |  |
| פרץ | Perets |  |
| לוסי | Lusi | Lucy |
| מאשה | Masha |  |
| יעלי | Yaali |  |
| ניקה | Nika |  |
| מנואל | Manuel |  |
| מינדי | Mindi |  |
| חזקיהו | Hizkiyahu |  |
| מלכי | Malki |  |
| איידי | Eidi |  |
| נוייה | Noya |  |
| עמנואלה | Imanuela |  |
| ביתיה | Bitya |  |
| מילאנה | Milana |  |
| הענדל | Hendl |  |
| הנדל | Hendl |  |
| אור-יה | Or-Ya |  |
| לי-יה | Li-Ya |  |
| זיסי | Zisi |  |
| סיון | Sivan |  |
| אורטל | Ortal |  |
| ויקטוריה | Viktorya | Victoria |
| רותי | Ruti |  |
| צליל | Tslil |  |
| מילנה | Milena |  |
| אביהו | Avihu |  |
| אסי | Asi |  |
| ג'ולי | Juli | Julie |
| טופז | Tofaz |  |
| גיטה | Gita |  |
| בינה | Bina |  |
| רגב | Regev |  |
| חסיה | Hasya |  |
| שמעיה | Shmaya |  |
| עילם | Eilam |  |
| אנאבל | Anabel | Annabelle |
| שריה | Sraya |  |
| שיינדי | Sheindi |  |
| אביגל | Avigal |  |
| לבונה | Levona |  |
| ניבי | Nivi |  |
| קיילי | Keili | Kylie |
| רויזא | Roiza |  |
| אפריל | April |  |
| פריידי | Freidi |  |
| היא-לי | Hi-Li |  |
| פדות | Pedut |  |
| מגן | Magen |  |
| גב | Gav |  |
| אורייה | Uriya |  |
| תלם | Telem |  |
| ליהוא | Lihu |  |
| קיארה | Kyara | Chiara |
| מון | Mun |  |
| מילוא | Milo |  |
| אבינתן | Avinatan |  |
| אבי | Avi |  |
| מיטל | Meital |  |
| אלירן | Eliran |  |
| אדוארד | Edvard | Edward |
| חנן | Hanan |  |
| רוזה | Roza |  |
| לינדה | Linda |  |
| סופי | Sofi | Sophie |
| כנרת | Kineret |  |
| רובין | Robin |  |
| תם | Tam |  |
| ג'ון | Jon | John |
| מתי | Mati |  |
| קסם | Kesem |  |
| אנג'לה | Anjela | Angela |
| לוטן | Lotan |  |
| קלמן | Kalman |  |
| שלוה | Shalva |  |
| קמילה | Kamila | Camila |
| דוריאן | Dorian |  |
| יקירה | Yakira |  |
| שבתי | Shabtai |  |
| ריזל | Reizl |  |
| קיילה | Keila |  |
| ברית | Brit |  |
| אמבר | Amber |  |
| אלישמע | Elishama |  |
| נחלה | Nahala |  |
| ידיד | Yedid |  |
| ג'ויס | Jois | Joyce |
| מלכות | Malkhut |  |
| אהוביה | Ahuvya |  |
| הלליה | Haleliya |  |
| מייקי | Maiki |  |
| דובער | Dober |  |
| שובאל | Shoval |  |
| שמש | Shemesh |  |
| אריא | Arya |  |
| תאו | Teo | Theo |
| רבקי | Rivki |  |
| כתר | Keter |  |
| נהרי | Nahari |  |
| גליקא | Glika |  |
| ענבל | Inbal |  |
| נופר | Nufar |  |
| איליה | Ilya |  |
| ניקול | Nikol |  |
| לירז | Liraz |  |
| נמרוד | Nimrod |  |
| פרידה | Frida |  |
| הגר | Hagar |  |
| תקוה | Tikva |  |
| ליליה | Lilya |  |
| ארנון | Arnon |  |
| עדה | Ada |  |
| נדיה | Nadya |  |
| בלהה | Bilha |  |
| שביט | Shavit |  |
| צוריאל | Tsuriel |  |
| יועד | Yoad |  |
| ויליאם | Vilyam | William |
| פרל | Perl |  |
| שראל | Sarel |  |
| ג'וי | Joi | Joy |
| בילה | Bila |  |
| נתיב | Nativ |  |
| לי-אור | Li-Or |  |
| ברקת | Bareket |  |
| תמרי | Tamari |  |
| איילון | Ayalon |  |
| רפאלה | Refaela |  |
| אלישי | Elishai |  |
| רנן | Ranan |  |
| קמיל | Kamil | Camille |
| אדרת | Aderet |  |
| אידל | Eidl |  |
| לי-ים | Li-Yam |  |
| דפני | Dafni |  |
| קלואי | Kloi | Chloe |
| ליונל | Lionel |  |
| רעכל | Rekhl |  |
| נוב | Nov |  |
| אלירם | Eliram |  |
| זרח | Zerah |  |
| זליג | Zelig |  |
| ברוק | Bruk | Brooke |
| עימנואל | Imanuel |  |
| גלבוע | Gilboa |  |
| מיקאלה | Mikaela |  |
| שאשא | Shasha |  |
| אליאורה | Eliora |  |
| אייבי | Aivi | Ivy |
| אודם | Odem |  |
| אלטא | Alta |  |
| איליין | Elein |  |
| נל | Nel |  |
| סטערנא | Sterna |  |
| כחל | Kahal |  |
| תיאודור | Teodor | Theodore |
| מתיא | Matiya |  |
| שדה | Sade |  |
| מיילו | Mailo | Milo |
| עמיה | Amya |  |
| בראשית | Breshit |  |
| רונה-לי | Rona-Li |  |
| גינענדל | Ginendl |  |
| אל-ים | El-Yam |  |
| עורי | Uri |  |
| לי-נס | Li-Nes |  |
| שרון | Sharon |  |
| ענת | Anat |  |
| יניב | Yaniv |  |
| רונית | Ronit |  |
| ליאת | Liat |  |
| מורן | Moran |  |
| ילנה | Yelena |  |
| רונן | Ronen |  |
| איריס | Iris |  |
| מרינה | Marina |  |
| גלית | Galit |  |
| בוריס | Boris |  |
| לימור | Limor |  |
| שירן | Shiran |  |
| אולגה | Olga |  |
| ולדימיר | Vladimir |  |
| סבטלנה | Svetlana |  |
| נורית | Nurit |  |
| טטיאנה | Tatyana | Tatiana |
| רויטל | Revital |  |
| דמיטרי | Dmitri | Dmitry |
| נטליה | Natalya | Natalia |
| יבגני | Yevgeni | Evgeny |
| דורית | Dorit |  |
| לאוניד | Leonid |  |
| יוליה | Yulya | Yulia |
| יוסי | Yosi |  |
| אורנה | Orna |  |
| עודד | Oded |  |
| יפעת | Yifat |  |
| עינת | Einat |  |
| סיגל | Sigal |  |
| שלומית | Shlomit |  |
| סמדר | Smadar |  |
| רינת | Rinat |  |
| ויקטור | Viktor | Victor |
| אתי | Eti |  |
| אינה | Ina | Inna |
| אירית | Irit |  |
| שלומי | Shlomi |  |
| סרגיי | Sergei | Sergey |
| אילנית | Ilanit |  |
| עינב | Einav |  |
| רומן | Roman |  |
| גלינה | Galina |  |
| רמי | Rami |  |
| סיגלית | Sigalit |  |
| קארין | Karin |  |
| אמנון | Amnon |  |
| מקסים | Maksim | Maxim |
| אולג | Oleg |  |
| לריסה | Larisa |  |
| רחמים | Rahamim |  |
| עדנה | Edna |  |
| אלינה | Alina |  |
| שובל | Shoval |  |
| יבגניה | Yevgenya | Evgenia |
| מירה | Mira |  |
| כרמלה | Karmela |  |
| רוית | Revayat |  |
| זיוה | Ziva |  |
| קרין | Karin |  |
| כרמית | Karmit |  |
| רוברט | Robert |  |
| אלן | Alen | Alan |
| שרונה | Sharona |  |
| מרי | Meri |  |
| ארקדי | Arkadi | Arkady |
| אושרת | Asheret |  |
| פבל | Pavel |  |
| יאנה | Yana |  |
| אוסנת | Osnat |  |
| פולינה | Polina |  |
| בני | Beni |  |
| שירז | Shiraz |  |
| ריטה | Rita |  |
| צחי | Tsahi |  |
| מוטי | Moti |  |
| הרצל | Hertsl |  |
| סוזן | Suzan | Susan |
| עירית | Irit |  |
| דניס | Denis |  |
| עידית | Idit |  |
| ויטלי | Vitali | Vitaly |
| כוכבה | Kokhava |  |
| אלדד | Eldad |  |
| סוניה | Sonya | Sonia |
| תמי | Tami |  |
| דורין | Dorin |  |
| קובי | Kovi |  |
| רפי | Rafi |  |
| אלנה | Elena |  |
| אנדריי | Andrei | Andrey |
| עפרה | Ofra |  |
| עמיר | Amir |  |
| אנסטסיה | Anastasya | Anastasia |
| ליזה | Liza |  |
| ציונה | Tsiyona |  |
| עופרה | Ofra |  |
| ירדנה | Yardena |  |
| לבנה | Levana |  |
| אושרית | Oshrit |  |
| יריב | Yariv |  |
| קלרה | Klara | Clara |
| אביבית | Avivit |  |
| עוזי | Uzi |  |
| אבירם | Aviram |  |
| ניצה | Nitsa |  |
| דקלה | Dikla |  |
| עמי | Ami |  |
| נירית | Nirit |  |
| סנדרה | Sandra |  |
| דלית | Dalit |  |
| מרטין | Martin |  |
| ימית | Yamit |  |
| ארתור | Artur | Arthur |
| שגית | Sagit |  |
| דיקלה | Dikla |  |
| ששון | Sason |  |
| רגינה | Regina |  |
| מירית | Mirit |  |
| ורה | Vera |  |
| גדי | Gedi |  |
| דנית | Danit |  |
| סמי | Sami |  |
| איציק | Itsik |  |
| לינור | Linor |  |
| ולריה | Valerya | Valeria |
| פיליפ | Filip | Philip |
| ורוניקה | Veronika | Veronica |
| יונית | Yonit |  |
| דגנית | Deganit |  |
| סימונה | Simona |  |
| שבתאי | Shabtai |  |
| גבי | Gabi |  |
| נירה | Nira |  |
| קורין | Korin |  |
| קטי | Keiti |  |
| אידה | Ida |  |
| קרינה | Karina |  |
| ליבנת | Livnat |  |
| שגיב | Sagiv |  |
| ולנטינה | Valentina |  |
| זהבית | Zehavit |  |
| סטיבן | Stiven | Steven |
| הלנה | Helena |  |
| בטי | Beti | Betty |
| אוקסנה | Oksana |  |
| שמרית | Shimrit |  |
| בת חן | Bat Hen |  |
| ויקי | Viki | Vicky |
| ג'סיקה | Jesika | Jessica |
| ליז | Liz |  |
| שולה | Shula |  |
| פזית | Pazit |  |
| זויה | Zoya |  |
| חופית | Hofit |  |
| אורנית | Ornit |  |
| אודי | Udi |  |
| חלי | Hali |  |
| מוניקה | Monika |  |
| גיורא | Giyora |  |
| דורה | Dora |  |
| רענן | Raanan |  |
| אופירה | Ofira |  |
| לורה | Lora | Laura |
| ישראלה | Yisrela |  |
| אופל | Opal |  |
| טניה | Tanya |  |
| סוזי | Suzi |  |
| הנרי | Henri | Henry |
| יניר | Yanir |  |
| סטפני | Stefani | Stephanie |
| איזבלה | Izabela | Isabella |
| אבלין | Evlin | Evelyn |
| ארטיום | Artiom | Artyom |
| אושרה | Oshra |  |
| צח | Tsah |  |
| לינה | Lina |  |
| אדי | Edi |  |
| ציפי | Tsipi |  |
| אבירן | Aviran |  |
| ברברה | Barbara |  |
| ליסה | Lisa |  |
| אילונה | Ilona |  |
| פאני | Fani | Fanny |
| עמירם | Amiram |  |
| מיקי | Miki |  |
| עדית | Adit |  |
| פרלה | Perla |  |
| ריבה | Riva |  |
| קטרין | Katrin |  |
| אניטה | Anita |  |
| ג'רמי | Jeremi | Jeremy |
| ניקיטה | Nikita |  |
| שנהב | Shenhav |  |
| צדוק | Tsadok |  |
| סטפן | Stefan |  |
| אירנה | Irena |  |
| גילת | Gilat |  |
| סוזנה | Suzana |  |
| איזבל | Izavel | Isabelle |
| פלורה | Flora |  |
| ורדית | Vardit |  |
| אורפז | Orpaz |  |
| רביב | Reviv |  |
| מני | Mani |  |
| אדית | Edit |  |
| מוניק | Monik | Monique |
| קסניה | Ksenya | Ksenia |
| סברינה | Sabrina |  |
| פטר | Peter |  |
| חנית | Hanit |  |
| אלברטו | Alberto |  |
| לואיס | Luis |  |
| רוזי | Rozi |  |
| רקפת | Rakefet |  |
| לנה | Lena |  |
| קלאודיה | Klaudya |  |
| קטיה | Katya |  |
| איבון | Ivon | Yvonne |
| קארן | Karen |  |
| אריקה | Erika |  |
| מריו | Mario |  |
| פאולה | Paula |  |
| טימור | Timur |  |
| צפריר | Tsafrir |  |
| חבצלת | Havatselet |  |
| ירמיהו | Yirmyahu | Jeremiah |
| יוספה | Yosefa |  |
| חזי | Hezi |  |
| דרורה | Drora |  |
| קריסטינה | Kristina |  |
| תימור | Timor |  |
| מגי | Megi |  |
| ליפז | Lifaz |  |
| אפי | Efi |  |
| פיטר | Piter | Peter |
| מייק | Maik | Mike |
| יערית | Yaarit |  |
| ליליאנה | Lilyana |  |
| מיטב | Meitav |  |
| רשל | Rashel | Rachelle |
| קרלוס | Karlos | Carlos |
| עתליה | Atalya |  |
| פרי | Pri |  |
| יום | Yom |  |
| זמירה | Zmira |  |
| חמדה | Hemda |  |
| רוזליה | Rozalya |  |
| חמוטל | Hamutal |  |
| יזהר | Yizhar |  |
| אנטוני | Antoni | Anthony |
| ג'ואל | Joel |  |
| אשרת | Asheret |  |
| צביקה | Tsvika |  |
| סטיב | Stiv | Steve |
| צופית | Tsufit |  |
| סשה | Sasha |  |
| קרולינה | Karolina | Carolina |
| אדריאנה | Adriana |  |
| סנדי | Sendi | Sandy |
| ארנה | Orna |  |
| דודו | Dudu |  |
| שושי | Shoshi |  |
| ניבה | Niva |  |
| כריסטינה | Kristina | Christina |
| אבידן | Avidan |  |
| עובד | Oved |  |
| קתרין | Katrin | Catherine |
| מרקו | Marko | Marco |
| נתנאלה | Netanela |  |
| חניתה | Hanita |  |
| טמיר | Tamir |  |
| כלנית | Kalanit |  |
| דודי | Dodi |  |
| ג'ק | Jek | Jack |
| גדליהו | Gedalyahu |  |
| ג'ונתן | Jonatan | Jonathan |
| רמה | Rama |  |
| נתי | Nati |  |
| קלי | Keli | Kelly |
| מורין | Morin |  |
| ארן | Oren |  |
| ריצ'רד | Richard |  |
| אופרי | Ofri |  |
| שם | Shem |  |
| גניה | Ganya |  |
| רוברטו | Roberto |  |
| אראלה | Arela |  |
| רווית | Revavit |  |
| תובל | Tuval |  |
| נרקיס | Narkis |  |
| זבולון | Zvulun | Zebulun |
| ליזי | Lizi |  |
| אליסיה | Alisya | Alicia |
| דומיניק | Dominik | Dominic |
| גונן | Gonen |  |
| אניה | Anya |  |
| פביאן | Fabyan |  |
| ארינה | Arina |  |
| ראול | Raul |  |
| נינט | Ninet |  |
| תומס | Tomas | Thomas |
| אלקה | Elka |  |
| בשמת | Bosmat |  |
| גיתית | Gitit |  |
| ליגל | Ligal |  |
| גלילה | Glila |  |
| אמנדה | Amanda |  |
| אודט | Odet |  |
| שאנל | Shanel | Chanel |
| בן-ציון | Ben-Tsiyon |  |
| עמיקם | Amikam |  |
| צמח | Tsemah |  |
| קוראל | Koral |  |
| זמיר | Zamir |  |
| דונה | Dona | Donna |
| אלזה | Elza | Elsa |
| עזריה | Azarya |  |
| ליעוז | Lioz |  |
| אלמז | Almaz |  |
| ימימה | Yemima |  |
| רחלה | Rahela |  |
| שירית | Shirit |  |
| ניראל | Nirel |  |
| סיימון | Saimon | Simon |
| הילית | Hilit |  |
| אוריאנה | Oriana |  |
| דרורית | Drorit |  |
| כוכב | Kokhav |  |
| עזר | Ezer |  |
| גנית | Ganit |  |
| בכור | Bekhor |  |
| אשלי | Ashli | Ashley |
| גואל | Goel |  |
| בקי | Beki | Becky |
| ליזט | Lizet |  |
| מלכיאל | Malkiel |  |
| נטשה | Natasha |  |
| לאונרדו | Leonardo |  |
| נופית | Nofit |  |
| סבסטיאן | Sebastian |  |
| אליחי | Elihai |  |
| תדהר | Tidhar |  |
| מילן | Milan |  |
| בריינדל | Breindl |  |
| גמליאל | Gamliel |  |
| טירן | Tiran |  |
| צאלה | Tseela |  |
| מסרט | Meseret |  |
| אנבל | Anabel | Annabelle |
| פלורנס | Florens | Florence |
| נצחיה | Nitshiya |  |
| שחק | Shahak |  |
| ניק | Nik |  |
| דיאגו | Diego |  |
| מרגרט | Margaret |  |
| שושן | Shushan |  |
| צהלה | Tsahola |  |
| אבא | Aba |  |
| לירם | Liram |  |
| קרלה | Karla | Carla |
| מרין | Marin |  |
| פיבי | Fibi | Phoebe |
| ריצרד | Richard |  |
| שמאי | Shamai |  |
| דיצה | Ditsa |  |
| נטעלי | Netali |  |
| ידין | Yadin |  |
| רנית | Ranit |  |
| דניה | Danya |  |
| ברנדה | Brenda |  |
| שנית | Shanit |  |
| אליצור | Elitsur |  |
| הלית | Helit |  |
| יהורם | Yehoram |  |
| קלייר | Kleir | Claire |
| עירא | Ira |  |
| אלרן | Elran |  |
| ויולט | Vaiolet | Violet |
| לטיסיה | Letisya | Leticia |
| חובב | Hovav |  |
| סלע | Sela |  |
| יפת | Yefet |  |
| ג'ולייט | Julyet | Juliet |
| אשד | Eshed |  |
| מידד | Meidad |  |
| גרציה | Gratsya |  |
| צפנת | Tsofnat |  |
| הינדל | Hindl |  |
| אתל | Etel |  |
| צוריה | Tsuriya |  |
| רהב | Rahav |  |
| תניה | Tanya |  |
| הדי | Hadi |  |
| רימונה | Rimona |  |
| פנינית | Pninit |  |
| מיגל | Migel | Miguel |
| לייב | Leib |  |
| ג'יימס | Jeims | James |
| שמוליק | Shmulik |  |
| אדלינה | Adelina |  |
| שלווה | Shalva |  |
| אייזיק | Aizik | Isaac |
| נטע-לי | Neta-Li |  |
| שקמה | Shikma |  |
| אמוץ | Amots |  |
| קרנית | Karnit |  |
| שונית | Shunit |  |
| עילית | Ilit |  |
| ראומה | Reuma |  |
| ערד | Arad |  |
| גידי | Gidi |  |
| נדיר | Nadir |  |
| לי-שי | Li-Shai |  |
| עירד | Irad |  |
| טלילה | Tlila |  |
| ניקי | Niki |  |
| טיראן | Tiran |  |
| יוכי | Yokhi |  |
| עמירה | Amira |  |
| אדמון | Admon |  |
| מרון | Meron |  |
| וויליאם | Viliam | William |
| נוית | Navit |  |
| הדרה | Hadara |  |
| דברת | Dovrat |  |
| חווה | Hava | Eve |
| יחיעם | Yehiam |  |
| סלעית | Salit |  |
| מורג | Morag |  |
| שרלוט | Sharlot | Charlotte |
| אומרי | Omri |  |
| סרג'יו | Serjo | Sergio |
| אוולינה | Evelina |  |
| כתריאל | Kitriel |  |
| גניפר | Jenifer | Jennifer |
| ליבת | Libat |  |
| חסידה | Hasida |  |
| סווטלנה | Svetlana |  |
| צורית | Tsurit |  |
| נבות | Navot |  |
| נירן | Niran |  |
| סביון | Savion |  |
| אמציה | Amatsya |  |
| חזקיה | Hizkiya |  |
| זיוית | Zivit |  |
| נעמן | Naaman |  |
| גני | Gani |  |
| דנאל | Daniel |  |
| ג'יין | Jein | Jane |
| עמינדב | Aminadav |  |
| ויטל | Vital |  |
| נאורה | Neora |  |
| יפעה | Yifa |  |
| איידן | Eiden | Aiden |
| גתית | Gitit |  |
| אביחיל | Avihayil |  |
| צפניה | Tsfanya |  |
| נהרה | Nehara |  |
| פייגל | Feigl |  |
| אמית | Amit |  |
| טים | Tim |  |
| יה-לי | Yah-Li |  |
| לארה | Lara |  |
| שירת | Shirat |  |
| ליבנה | Livne |  |
| דימה | Dima |  |
| שטרנא | Shterna |  |
| ויולטה | Violeta |  |
| אגנס | Agnes |  |
| ניקו | Niko |  |
| פולי | Poli |  |
| אלירון | Eliron |  |
| קייט | Keit | Kate |
| ישורון | Yeshurun |  |
| יגיל | Yagil |  |
| תרזה | Tereza |  |
| רע | Rea |  |
| לחן | Lahan |  |
| עשירה | Ashira |  |
| קלריס | Klaris | Clarice |
| רשף | Reshef |  |
| לוסיאנה | Lusyana | Luciana |
| גלאור | Galor |  |
| אלדן | Eldan |  |
| חדווה | Hedva |  |
| צמרת | Tsameret |  |
| לירום | Lirom |  |
| יהונדב | Yehonadav |  |
| אופאל | Opal |  |
| פליאה | Plia |  |
| חוליו | Hulio | Julio |
| עקיבה | Akiva |  |
| דייגו | Dyeigo | Diego |
| גסיקה | Jesika | Jessica |
| פועה | Pua |  |
| הינדי | Hindi |  |
| לילית | Lilit |  |
| תמנע | Timna |  |
| לי שי | Li Shai |  |
| גליל | Galil |  |
| ניצנה | Nitsana |  |
| לי-אל | Li-El |  |
| קלקידן | Kalkidan |  |
| מקדס | Mekdes |  |
| אחווה | Ahava |  |
| יתיר | Yatir |  |
| שיקמה | Shikma |  |
| ארזה | Arza |  |
| יונדב | Yonadav |  |
| לי אל | Li El |  |
| מתיתיהו | Matityahu |  |
| צרלס | Charls |  |
| זכאי | Zakai |  |
| הרצליה | Hertsliya |  |
| אלכסה | Aleksa |  |
| אתגר | Etgar |  |
| קרל | Karl |  |
| גדיאל | Gadiel |  |
| לירית | Lirit |  |
| מרגנית | Marganit |  |
| תמוז | Tamuz |  |
| סתוית | Stavit |  |
| יקי | Yaki |  |
| מריאנו | Maryano |  |
| מתת | Matat |  |
| רמית | Ramit |  |
| ירמי | Yirmi |  |
| יעלת חן | Yaalat Hen |  |
| אשרי | Ashrei |  |
| דובי | Dubi |  |
| אבישלום | Avishalom |  |
| דבורית | Dvorit |  |
| צוק | Tsuk |  |
| בן-אל | Ben-El |  |
| צרויה | Tsruya |  |
| גינת | Ginat |  |
| נוריה | Nuriya |  |
| פיי | Fei |  |
| אידו | Ido |  |
| נדיב | Nadiv |  |
| יעד | Yaad |  |
| אבידור | Avidor |  |
| אליעז | Eliaz |  |
| מצדה | Metsada |  |
| גיליה | Gilya |  |
| זילפה | Zilpa |  |
| זהורית | Zehorit |  |
| דינור | Dinur |  |
| אליהב | Elihav |  |
| איטן | Itan |  |
| אודיל | Odil |  |
| מקסין | Maksin | Maxine |
| וולטר | Valter | Walter |
| פלור | Flor |  |
| אלדור | Eldor |  |
| נופיה | Nofya |  |
| ברקאי | Barkai |  |
| קרן-אור | Keren-Or |  |
| פאולו | Paulo | Paolo |
| רמונה | Ramona |  |
| מרטינה | Martina |  |
| אשכר | Eshkar |  |
| זמר | Zemer |  |
| אשכול | Eshkol |  |
| תמירה | Tmira |  |
| חיותה | Hayuta |  |
| טלמור | Talmor |  |
| נטף | Nataf |  |
| אדירה | Adira |  |
| אנוש | Enosh |  |
| מקסימיליאן | Maksimilyan | Maximilian |
| משכית | Maskit |  |
| יואש | Yoash |  |
| אנגל | Enjel | Angel |
| שבח | Shevah |  |
| דוריאל | Doriel |  |
| צבר | Tsabar |  |
| אלסיה | Alesya |  |
| עלית | Ilit |  |
| בינת | Binat |  |
| צחית | Tsahit |  |
| אבינדב | Avinadav |  |
| שי-יה | Shai-Yah |  |
| יאשיהו | Yoshiyahu |  |
| פרננדה | Fernanda |  |
| מגל | Magal |  |
| טל-אור | Tal-Or |  |
| אלפרדו | Alfredo |  |
| צופנת | Tsofenet |  |
| שימעון | Shimon |  |
| לירוז | Liroz |  |
| בושמת | Bosmat |  |
| שחם | Shaham |  |
| העני | Heni |  |
| יודפת | Yodfat |  |
| דונלד | Donald |  |
| חוף | Hof |  |
| עזי | Uzi |  |
| אוצר | Otsar |  |
| אלבה | Alba |  |
| יון | Yon |  |
| ארנית | Ornit |  |
| יכין | Yakhin |  |
| ריצארד | Richard |  |
| עמל | Amal |  |
| דובב | Dovev |  |
| מנגיסטו | Mengistu |  |
| גת | Gat |  |
| נובה | Nova |  |
| נדר | Neder |  |
| פוריה | Poriya |  |
| אבגיל | Avigal |  |
| עתיר | Atir |  |
| לי-און | Li-On |  |
| יהלומית | Yahalomit |  |
| רוויה | Revaya |  |
| ווביט | Ubit |  |
| כנען | Knaan |  |
| יראל | Yirel |  |
| גורן | Goren |  |
| אליעם | Eliam |  |
| שיא | Si |  |
| גפנית | Gafnit |  |
| יובב | Yovav |  |
| אליעוז | Elioz |  |
| צהלי | Tsaholi |  |
| רצון | Ratson |  |
| צלילה | Tslila |  |
| ניתן | Nitan |  |
| ולדי | Valadi |  |
| אבישר | Avishar |  |
| עוגן | Ogen |  |
| בת אור | Bat Or |  |
| קטלינה | Katalina | Catalina |
| אביאלה | Aviela |  |
| אושן | Oshen | Ocean |
| פלד | Peled |  |
| שלהב | Shalhav |  |
| עוזיה | Uziya |  |
| מזלי | Mazali |  |
| ויקה | Vika |  |
| אוליבייה | Olivye | Olivier |
| פארן | Paran |  |
| שבא | Shva |  |
| עמיטל | Amital |  |
| רקיע | Rakia |  |
| נבון | Navon |  |
| תות | Tut |  |
| איבונה | Ivona |  |
| תלתן | Tiltan |  |
| תאנה | Teena |  |
| ג'ורג'יה | Jorjiya | Georgia |
| שפר | Shefer |  |
| בת-עמי | Bat-Ami |  |
| עבריה | Ivriya |  |
| קתי | Kati |  |
| הד | Hed |  |
| אדרה | Adara |  |
| גברי | Gavri |  |
| הראלה | Harela |  |
| אנטונלה | Antonela | Antonella |
| גאות | Geut |  |
| צדף | Tsedef |  |
| אלרז | Elraz |  |
| דורלי | Dorli |  |
| אשבל | Ashbel |  |
| נגבה | Negba |  |
| זאבה | Zeeva |  |
| בניאל | Bniel |  |
| שיר-לי | Shir-Li |  |
| אורנת | Orenet |  |
| מגד | Meged |  |
| אלינתן | Elinatan |  |
| ברוכה | Brukha |  |
| נריאל | Neriel |  |
| יום-טוב | Yom-Tov |  |
| יפרח | Yifrah |  |
| רוזטה | Rozeta |  |
| יהושפט | Yehoshafat |  |
| ארמין | Armin |  |
| בר-יוחאי | Bar-Yohai |  |
| ברקן | Barkan |  |
| שפיר | Shapir |  |
| אנפה | Anafa |  |
| יפי | Yofi |  |
| אלירוי | Eliroi |  |
| צהל | Tsohal |  |
| אונית | Onit |  |
| עתרת | Ateret |  |
| נאמן | Neeman |  |
| נועד | Noad |  |
| אליטל | Elital |  |
| שם-טוב | Shem-Tov |  |
| אהובית | Ahuvit |  |
| עלוה | Alva |  |
| מירום | Meirom |  |
| טימותי | Timoti | Timothy |
| נצחונה | Nitshona |  |
| סנונית | Snunit |  |
| גזית | Gazit |  |
| אביגד | Avigad |  |
| אבימלך | Avimelekh |  |
| ינעם | Yinam |  |
| אורורה | Orora | Aurora |
| אלונית | Alonit |  |
| רזיאלה | Raziela |  |
| אורדן | Ordan |  |
| עודדה | Odeda |  |
| אביצור | Avitsur |  |
| גמא | Gome |  |
| דנאור | Danor |  |
| רננית | Renanit |  |
| דיתה | Dita |  |
| אנטוניה | Antonya |  |
| אביאם | Aviam |  |
| בריטני | Britni | Britney |
| ענן | Anan |  |
| אדלי | Adli |  |
| אביהוד | Avihud |  |
| אחיאל | Ahiel |  |
| מענית | Maanit |  |
| עתירה | Atira |  |
| צוקית | Tsukit |  |
| ג'ובאני | Jivani | Giovanni |
| חצב | Hatsav |  |
| שיבולת | Shibolet |  |
| מדיסון | Medison | Madison |
| יבין | Yavin |  |
| קארל | Karl |  |
| שר-אל | Shar-El |  |
| ויאולה | Viola |  |
| רביבה | Reviva |  |
| סתונית | Stavinit |  |
| רוממה | Romema |  |
| אודטה | Odeta |  |
| אבינר | Aviner |  |
| אחיהוד | Ahihud |  |
| צדק | Tsedek |  |
| טיליה | Tilya |  |
| משואה | Masua |  |
| לוצ'יה | Luchiya | Lucia |
| רחלית | Rahelit |  |
| בן-עמי | Ben-Ami |  |
| בכורה | Bekhora |  |
| לפיד | Lapid |  |
| סחלב | Sahlav |  |
| תירוש | Tirosh |  |
| הלגה | Helga |  |
| ברוש | Brosh |  |
| שקדיה | Shkediya |  |
| יסעור | Yisor |  |
| אביאסף | Aviasaf |  |
| אביעם | Aviam |  |
| טל-שחר | Tal-Shahar |  |
| נס-לי | Nes-Li |  |
| הרדוף | Harduf |  |
| נץ | Nets |  |
| שלף | Shelef |  |
| בשן | Bashan |  |
| דגניה | Deganya |  |
| יהואש | Yehoash |  |
| עזית | Azit |  |
| אורים | Urim |  |
| זניה | Zinya |  |
| טמירה | Tmira |  |
| אליפז | Elifaz |  |
| שירטל | Shirtal |  |
| מדבר | Midbar |  |
| צארלס | Charls |  |
| מכבית | Makabit |  |
| עלווה | Alva |  |
| תקומה | Tekuma |  |
| אבני | Avni |  |
| לי-פז | Li-Faz |  |
| ארמינה | Armina |  |
| יצהל | Yitshal |  |
| נאות | Neot |  |
| לואיג'י | Luiji | Luigi |
| אלישיה | Alishya | Alicia |
| אטד | Atad |  |
| גושוע | Joshua |  |
| עילום | Ilom |  |
| יופיה | Yofiya |  |
| קדוש | Kadosh |  |
| אדירם | Adiram |  |
| אלמגור | Almagor |  |
| אחלמה | Ahlama |  |
| מלכיאור | Malkior |  |
| גפנה | Gafna |  |
| בהט | Bahat |  |
| בנגמין | Benjamin |  |
| לי-עוז | Li-Oz |  |
| גן-יה | Gan-Ya |  |
| שירי-לי | Shiri-Li |  |
