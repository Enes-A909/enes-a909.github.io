const menuAcmaButonu = document.querySelector('.mobile-toggle');
const navBaglantilari = document.querySelector('.nav-links');
const navOgeleri = document.querySelectorAll('.nav-links a');

// Toggle Mobile Menu
menuAcmaButonu.addEventListener('click', () => {
    navBaglantilari.classList.toggle('active');
    const ikon = menuAcmaButonu.querySelector('i');

    if (navBaglantilari.classList.contains('active')) {
        ikon.classList.remove('fa-bars');
        ikon.classList.add('fa-xmark');
    } else {
        ikon.classList.remove('fa-xmark');
        ikon.classList.add('fa-bars');
    }
});

// Close Mobile Menu on Click
navOgeleri.forEach(oge => {
    oge.addEventListener('click', () => {
        navBaglantilari.classList.remove('active');
        const ikon = menuAcmaButonu.querySelector('i');
        ikon.classList.remove('fa-xmark');
        ikon.classList.add('fa-bars');
    });
});

const MOBIL_ESIK = 768;
const projeKartlari = document.querySelectorAll('.project-card:not(.final-card)');
const projeModalKaplama = document.createElement('div');
const projelerKaydirici = document.querySelector('.projects-slider');
const sertifikaBolumu = document.querySelector('#certifications');
const sertifikaKapsayici = sertifikaBolumu ? sertifikaBolumu.querySelector('.container') : null;
const sertifikaIzgarasi = sertifikaBolumu ? sertifikaBolumu.querySelector('.cert-grid') : null;
const sertifikaModalKaplama = document.createElement('div');
let otomatikKaydiriciAralikId = null;
let otomatikKaydiriciYon = 1;
let otomatikKaydiriciIndeks = 0;
let otomatikKaydiriciDevamZamanlayiciId = null;
let kaydiriciEtkilesimBaglandi = false;
let sertifikaUstDahaFazlaButonu = null;
let sertifikaAltDahaFazlaButonu = null;
let sertifikaAltDahaFazlaSarmalayi = null;
let sertifikaMasaustuGenisletildi = false;

projeModalKaplama.className = 'project-modal-overlay';
projeModalKaplama.innerHTML = '<div class="project-modal" role="dialog" aria-modal="true"></div>';
document.body.appendChild(projeModalKaplama);

const projeModali = projeModalKaplama.querySelector('.project-modal');

sertifikaModalKaplama.className = 'cert-modal-overlay';
sertifikaModalKaplama.innerHTML = '<div class="cert-modal" role="dialog" aria-modal="true"></div>';
document.body.appendChild(sertifikaModalKaplama);

const sertifikaModali = sertifikaModalKaplama.querySelector('.cert-modal');

function mobilGorunumMu() {
    return window.innerWidth <= MOBIL_ESIK;
}

function projeModaliniKapat() {
    projeModalKaplama.classList.remove('active');
    projeModali.innerHTML = '';
}

function projeModaliniAc(kart) {
    projeModali.innerHTML = '';
    const kapatButonu = document.createElement('button');
    kapatButonu.type = 'button';
    kapatButonu.className = 'modal-close-btn';
    kapatButonu.setAttribute('aria-label', 'Pop-up kapat');
    kapatButonu.innerHTML = '&times;';
    kapatButonu.addEventListener('click', projeModaliniKapat);

    const icerikKopyasi = kart.querySelector('.project-content').cloneNode(true);
    icerikKopyasi.querySelectorAll('.project-toggle-btn').forEach(buton => buton.remove());
    projeModali.appendChild(kapatButonu);
    projeModali.appendChild(icerikKopyasi);
    projeModalKaplama.classList.add('active');
}

function sertifikaModaliniKapat() {
    sertifikaModalKaplama.classList.remove('active');
    sertifikaModali.innerHTML = '';
}

function sertifikaModaliniAc() {
    if (!sertifikaIzgarasi) return;

    sertifikaModali.innerHTML = '';
    const kapatButonu = document.createElement('button');
    kapatButonu.type = 'button';
    kapatButonu.className = 'modal-close-btn';
    kapatButonu.setAttribute('aria-label', 'Pop-up kapat');
    kapatButonu.innerHTML = '&times;';
    kapatButonu.addEventListener('click', sertifikaModaliniKapat);

    const sertifikaIzgaraKopyasi = sertifikaIzgarasi.cloneNode(true);
    sertifikaIzgaraKopyasi.classList.remove('cert-grid-collapsed-mobile');
    sertifikaIzgaraKopyasi.classList.remove('cert-grid-collapsed-desktop');
    sertifikaIzgaraKopyasi.querySelectorAll('.cert-card-link.is-hidden-cert').forEach((oge) => {
        oge.classList.remove('is-hidden-cert');
    });
    sertifikaModali.appendChild(kapatButonu);
    sertifikaModali.appendChild(sertifikaIzgaraKopyasi);
    sertifikaModalKaplama.classList.add('active');
}

function kartKompaktliginiAyarla(kart, kompaktMi) {
    kart.classList.toggle('is-compact', kompaktMi);
    const gecisButonu = kart.querySelector('.project-toggle-btn');

    if (!gecisButonu) return;

    if (mobilGorunumMu()) {
        gecisButonu.textContent = 'Daha fazla gör';
        return;
    }

    gecisButonu.textContent = kompaktMi ? 'Daha fazla gör' : 'Daha az gör';
}

function projeKartlariniBaslat() {
    projeKartlari.forEach(kart => {
        let gecisButonu = kart.querySelector('.project-toggle-btn');

        if (!gecisButonu) {
            gecisButonu = document.createElement('button');
            gecisButonu.type = 'button';
            gecisButonu.className = 'project-toggle-btn';
            gecisButonu.textContent = 'Daha fazla gör';
            kart.appendChild(gecisButonu);
        }

        kartKompaktliginiAyarla(kart, true);

        gecisButonu.onclick = () => {
            if (mobilGorunumMu()) {
                projeModaliniAc(kart);
                return;
            }

            const kompaktOlmaliMi = !kart.classList.contains('is-compact');
            kartKompaktliginiAyarla(kart, kompaktOlmaliMi);
        };
    });
}

function otomatikKaydiriciyiDurdur() {
    if (otomatikKaydiriciAralikId !== null) {
        window.clearInterval(otomatikKaydiriciAralikId);
        otomatikKaydiriciAralikId = null;
    }

    if (otomatikKaydiriciDevamZamanlayiciId !== null) {
        window.clearTimeout(otomatikKaydiriciDevamZamanlayiciId);
        otomatikKaydiriciDevamZamanlayiciId = null;
    }
}

function kaydiriciIndeksiniEnYakinKartaEsitle(kaydiriciOgeleri) {
    if (!projelerKaydirici || kaydiriciOgeleri.length === 0) return;

    let enYakinIndeks = 0;
    let enYakinUzaklik = Number.POSITIVE_INFINITY;

    kaydiriciOgeleri.forEach((oge, indeks) => {
        const uzaklik = Math.abs(projelerKaydirici.scrollLeft - oge.offsetLeft);
        if (uzaklik < enYakinUzaklik) {
            enYakinUzaklik = uzaklik;
            enYakinIndeks = indeks;
        }
    });

    otomatikKaydiriciIndeks = enYakinIndeks;
}

function otomatikKaydiriciyiGecikmeliYenidenBaslat(gecikmeMs = 2600) {
    if (otomatikKaydiriciDevamZamanlayiciId !== null) {
        window.clearTimeout(otomatikKaydiriciDevamZamanlayiciId);
    }

    otomatikKaydiriciDevamZamanlayiciId = window.setTimeout(() => {
        otomatikKaydiriciyiBaslat();
    }, gecikmeMs);
}

function kaydiriciEtkilesimDuraklatmasiniBagla(kaydiriciOgeleri) {
    if (!projelerKaydirici || kaydiriciEtkilesimBaglandi) return;

    const duraklatVeDevamEt = () => {
        otomatikKaydiriciyiDurdur();
        kaydiriciIndeksiniEnYakinKartaEsitle(kaydiriciOgeleri);
        otomatikKaydiriciyiGecikmeliYenidenBaslat();
    };

    projelerKaydirici.addEventListener('pointerdown', duraklatVeDevamEt, { passive: true });
    projelerKaydirici.addEventListener('touchstart', duraklatVeDevamEt, { passive: true });
    projelerKaydirici.addEventListener('wheel', duraklatVeDevamEt, { passive: true });
    kaydiriciEtkilesimBaglandi = true;
}

function otomatikKaydiriciyiBaslat() {
    otomatikKaydiriciyiDurdur();

    if (!projelerKaydirici) return;
    if (!mobilGorunumMu()) return;

    const kaydiriciOgeleri = Array.from(projelerKaydirici.querySelectorAll('.project-card'));
    if (kaydiriciOgeleri.length < 2) return;

    kaydiriciEtkilesimDuraklatmasiniBagla(kaydiriciOgeleri);
    kaydiriciIndeksiniEnYakinKartaEsitle(kaydiriciOgeleri);

    if (otomatikKaydiriciIndeks <= 0) otomatikKaydiriciYon = 1;
    if (otomatikKaydiriciIndeks >= kaydiriciOgeleri.length - 1) otomatikKaydiriciYon = -1;

    const aralikMs = 3200;

    otomatikKaydiriciAralikId = window.setInterval(() => {
        if (!mobilGorunumMu()) return;

        const enBuyukIndeks = kaydiriciOgeleri.length - 1;
        if (otomatikKaydiriciIndeks >= enBuyukIndeks) otomatikKaydiriciYon = -1;
        if (otomatikKaydiriciIndeks <= 0) otomatikKaydiriciYon = 1;

        otomatikKaydiriciIndeks += otomatikKaydiriciYon;

        projelerKaydirici.scrollTo({
            left: kaydiriciOgeleri[otomatikKaydiriciIndeks].offsetLeft,
            behavior: 'smooth'
        });
    }, aralikMs);
}

function sertifikaKartBaglantilariniGetir() {
    if (!sertifikaIzgarasi) return [];
    return Array.from(sertifikaIzgarasi.querySelectorAll('.cert-card-link'));
}

function sertifikaKontrolleriniHazirla() {
    if (!sertifikaKapsayici || !sertifikaIzgarasi) return;
    const sertifikaBasligi = sertifikaKapsayici.querySelector('.section-title');

    if (!sertifikaUstDahaFazlaButonu) {
        sertifikaUstDahaFazlaButonu = document.createElement('button');
        sertifikaUstDahaFazlaButonu.type = 'button';
        sertifikaUstDahaFazlaButonu.className = 'cert-more-btn cert-more-top-btn';
        sertifikaUstDahaFazlaButonu.textContent = 'Daha fazla gör';
        sertifikaUstDahaFazlaButonu.addEventListener('click', sertifikaModaliniAc);
    }

    if (!sertifikaAltDahaFazlaSarmalayi) {
        sertifikaAltDahaFazlaSarmalayi = document.createElement('div');
        sertifikaAltDahaFazlaSarmalayi.className = 'cert-more-bottom-wrap';
    }

    if (!sertifikaAltDahaFazlaButonu) {
        sertifikaAltDahaFazlaButonu = document.createElement('button');
        sertifikaAltDahaFazlaButonu.type = 'button';
        sertifikaAltDahaFazlaButonu.className = 'cert-more-btn cert-more-bottom-btn';
        sertifikaAltDahaFazlaButonu.textContent = 'Daha fazla gör';
        sertifikaAltDahaFazlaButonu.addEventListener('click', () => {
            const sertifikaKartlari = sertifikaKartBaglantilariniGetir();
            if (!sertifikaKartlari.length) return;

            sertifikaMasaustuGenisletildi = !sertifikaMasaustuGenisletildi;

            if (sertifikaMasaustuGenisletildi) {
                sertifikaIzgarasi.classList.remove('cert-grid-collapsed-desktop');
                sertifikaKartlari.forEach((oge) => oge.classList.remove('is-hidden-cert'));
                sertifikaAltDahaFazlaSarmalayi.classList.add('expanded');
                sertifikaAltDahaFazlaButonu.textContent = 'Daha az gör';
                return;
            }

            sertifikaKartlari.forEach((oge) => oge.classList.remove('is-hidden-cert'));
            sertifikaKartlari.slice(8).forEach((oge) => oge.classList.add('is-hidden-cert'));
            sertifikaIzgarasi.classList.add('cert-grid-collapsed-desktop');
            sertifikaAltDahaFazlaSarmalayi.classList.remove('expanded');
            sertifikaAltDahaFazlaButonu.textContent = 'Daha fazla gör';
        });
    }

    if (!sertifikaUstDahaFazlaButonu.parentElement && sertifikaBasligi) {
        sertifikaBasligi.insertAdjacentElement('afterend', sertifikaUstDahaFazlaButonu);
    }

    if (!sertifikaAltDahaFazlaSarmalayi.parentElement) {
        sertifikaIzgarasi.insertAdjacentElement('afterend', sertifikaAltDahaFazlaSarmalayi);
    }

    if (!sertifikaAltDahaFazlaButonu.parentElement) {
        sertifikaAltDahaFazlaSarmalayi.appendChild(sertifikaAltDahaFazlaButonu);
    }
}

function sertifikaGorunumunuBaslat() {
    if (!sertifikaIzgarasi || !sertifikaKapsayici) return;

    sertifikaKontrolleriniHazirla();
    const sertifikaKartlari = sertifikaKartBaglantilariniGetir();

    sertifikaKartlari.forEach((oge) => oge.classList.remove('is-hidden-cert'));
    sertifikaIzgarasi.classList.remove('cert-grid-collapsed-mobile', 'cert-grid-collapsed-desktop');
    sertifikaUstDahaFazlaButonu.classList.remove('active');
    sertifikaAltDahaFazlaSarmalayi.classList.remove('active');
    sertifikaAltDahaFazlaSarmalayi.classList.remove('expanded');
    sertifikaMasaustuGenisletildi = false;

    if (mobilGorunumMu()) {
        if (sertifikaKartlari.length > 4) {
            sertifikaKartlari.slice(4).forEach((oge) => oge.classList.add('is-hidden-cert'));
            sertifikaIzgarasi.classList.add('cert-grid-collapsed-mobile');
            sertifikaUstDahaFazlaButonu.classList.add('active');
        }
        return;
    }

    if (sertifikaKartlari.length > 8) {
        sertifikaKartlari.slice(8).forEach((oge) => oge.classList.add('is-hidden-cert'));
        sertifikaIzgarasi.classList.add('cert-grid-collapsed-desktop');
        sertifikaAltDahaFazlaSarmalayi.classList.add('active');
        sertifikaAltDahaFazlaButonu.textContent = 'Daha fazla gör';
    }
}

projeModalKaplama.addEventListener('click', (olay) => {
    if (olay.target === projeModalKaplama) {
        projeModaliniKapat();
    }
});

sertifikaModalKaplama.addEventListener('click', (olay) => {
    if (olay.target === sertifikaModalKaplama) {
        sertifikaModaliniKapat();
    }
});

document.addEventListener('keydown', (olay) => {
    if (olay.key === 'Escape') {
        projeModaliniKapat();
        sertifikaModaliniKapat();
    }
});

window.addEventListener('resize', () => {
    projeKartlari.forEach(kart => kartKompaktliginiAyarla(kart, true));
    if (!mobilGorunumMu()) {
        projeModaliniKapat();
        sertifikaModaliniKapat();
        otomatikKaydiriciyiDurdur();
    } else {
        otomatikKaydiriciyiBaslat();
    }
    sertifikaGorunumunuBaslat();
});

projeKartlariniBaslat();
otomatikKaydiriciyiBaslat();
sertifikaGorunumunuBaslat();
