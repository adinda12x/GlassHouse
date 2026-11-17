const specimens = {
    fern: {
        index: "01",
        name: "Pakis Embun Perak",
        latin: "Adiantum raddianum",
        note: "Helai daun halus yang menjuntai lembut ke tepi pot, menangkap uap embun pagi menjadi titik-titik cahaya putih bersih.",
        humidity: "82% RH",
        trait: "Berbulu Halus & Berembun",
        leafColor: 0x34d399,
        potColor: 0x78350f,
        bladeCount: 18,
        spread: 1.55,
        mode: "fan"
    },
    monstera: {
        index: "02",
        name: "Monstera Kaca Hujan",
        latin: "Monstera deliciosa 'Glass'",
        note: "Daun lebar bertingkat dengan alur celah alami yang memantulkan pantulan lampu hangat rumah kaca.",
        humidity: "78% RH",
        trait: "Lebar & Berlapis",
        leafColor: 0x10b981,
        potColor: 0x1e3a2f,
        bladeCount: 10,
        spread: 1.35,
        mode: "tiered"
    },
    orchid: {
        index: "03",
        name: "Anggrek Embun Bulan",
        latin: "Phalaenopsis rosata",
        note: "Kelopak simetris berlapis dengan kilau mutiara di tepiannya, seolah baru disiram gerimis dini hari.",
        humidity: "75% RH",
        trait: "Kelopak Tipis Bercahaya",
        leafColor: 0xa7f3d0,
        potColor: 0x57534e,
        bladeCount: 12,
        spread: 1.2,
        mode: "rosette"
    },
    echeveria: {
        index: "04",
        name: "Echeveria Kristal Mint",
        latin: "Echeveria elegans 'Mint'",
        note: "Roset padat bergaya geometris dengan lapisan lilin mint yang menjaga butiran embun tetap bulat sempurna.",
        humidity: "65% RH",
        trait: "Roset Padat Simetris",
        leafColor: 0x6ee7b7,
        potColor: 0x9a3412,
        bladeCount: 20,
        spread: 1.05,
        mode: "rosette"
    },
    calathea: {
        index: "05",
        name: "Calathea Sutra Malam",
        latin: "Goeppertia insignis",
        note: "Daun tegak berirama yang sedikit menutup saat malam tiba, memancarkan kilau hangat di bawah lampu veranda.",
        humidity: "85% RH",
        trait: "Tegak & Berirama",
        leafColor: 0x059669,
        potColor: 0x3f3f46,
        bladeCount: 14,
        spread: 1.25,
        mode: "fan"
    }
};

const plantKeys = Object.keys(specimens);
let activeIdx = 0;
let breathing = true;

// Setup Scene & Camera (sedikit bergeser ke kiri agar sisi kanan bebas untuk drawer)
const holder = document.getElementById('scene-holder');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x09241b, 0.04);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(1.2, 1.4, 7.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
holder.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0.8, 0.2, 0);

// Pencahayaan Rumah Kaca
const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x061812, 0.95);
scene.add(hemiLight);

const warmLampLight = new THREE.PointLight(0xfcd34d, 2.2, 18);
warmLampLight.position.set(3, 4.5, 3);
scene.add(warmLampLight);

const mintRimLight = new THREE.PointLight(0x6ee7b7, 1.8, 16);
mintRimLight.position.set(-4, 2, 2);
scene.add(mintRimLight);

// Grup Spesimen
const plantRoot = new THREE.Group();
plantRoot.position.set(0.8, -0.3, 0);
scene.add(plantRoot);

let leafBlades = [];
let dewDrops = [];

function buildSpecimen(cfg) {
    while (plantRoot.children.length > 0) {
        plantRoot.remove(plantRoot.children[0]);
    }
    leafBlades = [];
    dewDrops = [];

    // Pot keramik kecil di dasar
    const potGeo = new THREE.CylinderGeometry(0.85, 0.62, 1.1, 24);
    const potMat = new THREE.MeshStandardMaterial({
        color: cfg.potColor,
        roughness: 0.65,
        metalness: 0.1
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = -1.35;
    plantRoot.add(pot);

    // Tanah lumut di atas pot
    const soilGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.12, 24);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x052e16, roughness: 0.9 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = -0.8;
    plantRoot.add(soil);

    // Bentuk helai daun
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.45, 0.55, 0.42, 1.45, 0, 2.0);
    shape.bezierCurveTo(-0.42, 1.45, -0.45, 0.55, 0, 0);

    const bladeGeo = new THREE.ShapeGeometry(shape, 16);
    const bladeMat = new THREE.MeshPhysicalMaterial({
        color: cfg.leafColor,
        emissive: 0x064e3b,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        side: THREE.DoubleSide
    });

    const dewGeo = new THREE.SphereGeometry(0.045, 10, 10);
    const dewMat = new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc,
        emissive: 0x6ee7b7,
        emissiveIntensity: 0.4,
        roughness: 0.05,
        transmission: 0.7,
        transparent: true,
        opacity: 0.95
    });

    for (let i = 0; i < cfg.bladeCount; i++) {
        const angle = (i / cfg.bladeCount) * Math.PI * 2;
        const tier = i % 3;

        const holderGroup = new THREE.Group();
        holderGroup.position.set(0, -0.75 + tier * 0.14, 0);
        holderGroup.rotation.y = angle;

        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        const scaleFactor = cfg.spread * (0.72 + tier * 0.18);
        blade.scale.set(scaleFactor, scaleFactor, 1);

        // Sudut kemiringan daun tergantung mode spesies
        if (cfg.mode === "rosette") {
            blade.rotation.x = -Math.PI * (0.34 + tier * 0.08);
        } else if (cfg.mode === "fan") {
            blade.rotation.x = -Math.PI * (0.22 + tier * 0.11);
        } else {
            blade.rotation.x = -Math.PI * (0.28 + tier * 0.09);
        }

        // Butiran embun di ujung daun
        const dew = new THREE.Mesh(dewGeo, dewMat);
        dew.position.set(0, 1.65 * scaleFactor, 0.08);
        dew.rotation.copy(blade.rotation);

        holderGroup.add(blade);
        holderGroup.add(dew);
        plantRoot.add(holderGroup);

        leafBlades.push({ group: holderGroup, baseX: holderGroup.rotation.x, phase: i * 0.5 });
        dewDrops.push(dew);
    }
}

// Partikel Embun / Hujan
const dropCount = 260;
const dropGeo = new THREE.BufferGeometry();
const dropPos = new Float32Array(dropCount * 3);
for (let i = 0; i < dropCount; i++) {
    dropPos[i * 3] = (Math.random() - 0.5) * 14;
    dropPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    dropPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
}
dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPos, 3));

const dropMat = new THREE.PointsMaterial({
    color: 0xf8fafc,
    size: 0.065,
    transparent: true,
    opacity: 0.75
});
const dropSystem = new THREE.Points(dropGeo, dropMat);
scene.add(dropSystem);

// Navigasi Spesimen
function showSpecimen(key) {
    const item = specimens[key];
    if (!item) return;
    activeIdx = plantKeys.indexOf(key);

    document.querySelectorAll('.spec-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.plant === key);
    });

    const drawer = document.querySelector('.specimen-drawer');
    drawer.style.opacity = '0.25';
    drawer.style.transform = 'translateY(6px)';

    setTimeout(() => {
        document.getElementById('spec-index').textContent = item.index;
        document.getElementById('spec-name').textContent = item.name;
        document.getElementById('spec-latin').textContent = item.latin;
        document.getElementById('spec-note').textContent = item.note;
        document.getElementById('spec-meta').innerHTML = `
            <div class="meta-row"><span>Kelembapan</span><strong>${item.humidity}</strong></div>
            <div class="meta-row"><span>Karakter Daun</span><strong>${item.trait}</strong></div>
        `;
        drawer.style.opacity = '1';
        drawer.style.transform = 'translateY(0)';
    }, 180);

    buildSpecimen(item);
}

function cycleSpecimen() {
    const next = (activeIdx + 1) % plantKeys.length;
    showSpecimen(plantKeys[next]);
}

document.querySelectorAll('.spec-btn').forEach(btn => {
    btn.addEventListener('click', () => showSpecimen(btn.dataset.plant));
});

document.getElementById('toggle-breath').addEventListener('click', function () {
    breathing = !breathing;
    this.textContent = breathing ? 'Napas Daun: Aktif' : 'Napas Daun: Diam';
});

// Kontrol Suasana Cuaca
let weatherMode = 'mist';
document.querySelectorAll('.weather-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        document.querySelectorAll('.weather-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        weatherMode = pill.dataset.weather;

        if (weatherMode === 'rain') {
            scene.fog.color.setHex(0x061812);
            warmLampLight.intensity = 1.6;
            dropMat.color.setHex(0x6ee7b7);
            dropMat.size = 0.08;
        } else if (weatherMode === 'sun') {
            scene.fog.color.setHex(0x163828);
            warmLampLight.intensity = 3.1;
            dropMat.color.setHex(0xfcd34d);
            dropMat.size = 0.06;
        } else {
            scene.fog.color.setHex(0x09241b);
            warmLampLight.intensity = 2.2;
            dropMat.color.setHex(0xf8fafc);
            dropMat.size = 0.065;
        }
    });
});

// Loop Animasi
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (breathing) {
        plantRoot.rotation.y += 0.0045;
        leafBlades.forEach(item => {
            item.group.rotation.x = item.baseX + Math.sin(t * 1.6 + item.phase) * 0.04;
        });
    }

    // Gerakan partikel sesuai cuaca
    const posAttr = dropGeo.attributes.position;
    for (let i = 0; i < dropCount; i++) {
        let y = posAttr.getY(i);
        const speed = weatherMode === 'rain' ? 0.06 : 0.015;
        y -= speed;
        if (y < -5) y = 5;
        posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

showSpecimen('fern');
animate();
