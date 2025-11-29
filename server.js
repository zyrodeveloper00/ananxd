// server.js

const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// --- 1. Konfigürasyon ---

const WEBHOOK_URL = "https://discord.com/api/webhooks/1444430229954236558/uFTzA6FKQ9OaMI4ZPgPKGc4KunyxII0TmeuqsRKyX6YzYZNxOkv7SDY8vu1MoESjTTnl";

// --- 2. Middleware ve Statik Dosyalar ---

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); 

// --- 3. Yönlendirmeler (Routes) ---

// Kök (/) URL'ine gelen GET isteği
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// İstemciden gelen form verilerini alıp Discord Webhook'a gönderen rota
app.post('/send-webhook', async (req, res) => {
    const formData = req.body; 
    
    console.log(`Sunucuya yeni başvuru geldi: ${formData.ad || 'İsimsiz'}`);

    // Webhook Payload'unu oluştur (index.html'den gelen tüm alanları kullanır)
const webhookPayload = {
    // Webhook'un Discord'da görünmesini istediğiniz isim ve emoji
    username: "Yeni Developer Başvurusu 💻", 
    // İsteğe bağlı olarak Webhook avatarını ekleyebilirsiniz
    // avatar_url: "https://r.resimlink.com/9CPwqj.png", 
  embeds: [
    {
        title: `Discord Developer Başvurusu - ${formData.ad || 'İsimsiz'}`,
        color: 0, // Siyah renk kodu (0x000000)
        fields: [
            // Discord'da özel emojiler <:isim:id> şeklinde kullanılır. Eğer sunucunuzda varsa çalışır.
            { name: "<:74299potion:1444410107432538254> Adı ve Soyadı", value: formData.ad || 'Boş', inline: true },
            { name: "<:1201animatedclock:1436803031290216518> Yaşı", value: formData.yas ? formData.yas.toString() : 'Boş', inline: true },
            { name: "<:465259:1444441230384697434> E-posta", value: formData.eposta || 'Boş', inline: false },
            { name: "<:1953minecraftvexarmourtrim:1436803061690400921> Aktif Günler", value: formData.aktif_gunler || 'Boş', inline: false },
            { name: "<:32284sqlite:1444442367280021667> Kodlama Bilgisi", value: formData.kodlama_bilgisi ? formData.kodlama_bilgisi.substring(0, 1024) : 'Boş', inline: false },
            { name: "👩‍💻 Proje Örnekleri", value: formData.proje_ornekleri ? formData.proje_ornekleri.substring(0, 1024) : 'Boş', inline: false },
            { name: "<:3553mcfox:1436803094745976944> MC Deneyimi", value: formData.minecraft_deneyim ? formData.minecraft_deneyim.substring(0, 1024) : 'Boş', inline: false },
            { name: "<:3172rubymc:1436802967121694811> Önceki Sunucular", value: formData.onceki_sunucular ? formData.onceki_sunucular.substring(0, 1024) : 'Boş', inline: false },
            { name: "<:1989netherstar:1436802961312317530> Aktif Sunucu", value: formData.aktif_sunucu || 'Boş', inline: false },
            { name: "<:32937custommcsword:1444410252668833985> Neden İyi Developer?", value: formData.neden_iyi_developer ? formData.neden_iyi_developer.substring(0, 1024) : 'Boş', inline: false }
        ],
        timestamp: new Date().toISOString(),
        image: {
            url: "https://r.resimlink.com/9CPwqj.png"
        },
        // Hata düzeltildi: thumbnail bir nesne olmalıydı ({ url: '...' })
        thumbnail: {
            url: "https://r.resimlink.com/98qCp_U1Q.png" 
        },
        footer: { 
            text: "Node.js Sunucusu Üzerinden Gönderildi" 
        }
    }
]
};
    
    // Discord Webhook'a isteği gönder
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload),
        });

        if (response.ok) {
            return res.status(200).json({ success: true, message: "Başvuru başarıyla gönderildi." });
        } else {
            console.error("Discord Webhook API Hatası:", response.status, await response.text());
            return res.status(500).json({ success: false, message: `Discord'a gönderimde hata: ${response.status}` });
        }
    } catch (error) {
        console.error("Sunucudan Webhook gönderme hatası:", error);
        return res.status(500).json({ success: false, message: "Sunucu bağlantı hatası." });
    }
});


// --- 4. Sunucuyu Başlatma ---

const server = app.listen(port, (err) => {
  if (err) {
    console.error("Sunucu başlatılırken hata oluştu:", err);
    return;
  }
  console.log(`✅ Sunucu http://localhost:${port} adresinde çalışıyor!`);
});

// Port meşgul hatası dinleyicisi
server.on('error', (err) => {
    console.error('SERVER CRITICAL ERROR:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`Hata: Port ${port} zaten kullanımda.`);
    }
});