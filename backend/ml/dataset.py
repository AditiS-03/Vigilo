"""
Vigilo Labeled Dataset for Scam & Phishing Detection
Contains verified legitimate sites and high-risk scam/phishing vectors.
Clearly labeled demo dataset engineered for hackathon reproducibility.
"""

LABELED_DATASET = [
    # Safe - Educational & Kids
    {"url": "https://kids.nationalgeographic.com/animals", "page": "Discover amazing animal facts and play games.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://scratch.mit.edu/projects/editor", "page": "Create stories, games, and animations. Share with others.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://code.org/learn", "page": "Anyone can learn computer science. Fun interactive tutorials.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://www.khanacademy.org/kids", "page": "Free fun educational program for kids. Early math and reading.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://pbskids.org/games", "page": "Play free educational games with your favorite PBS characters.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://www.nasa.gov/learning-resources/nasa-kids-club", "page": "Space STEM exploration for young astronomers.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://en.wikipedia.org/wiki/Solar_System", "page": "The Solar System is the gravitationally bound system of the Sun.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://www.bbc.co.uk/cbeebies", "page": "Fun games, puzzles, and stories for young children.", "pwd": 0, "label": 0, "category": "safe"},
    
    # Safe - Legitimate Gaming & Tech Platforms
    {"url": "https://www.minecraft.net/en-us", "page": "Explore new gaming adventures, create epic builds, and join friends.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://www.minecraft.net/en-us/marketplace", "page": "Discover community-made skins, textures, and worlds.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://www.curseforge.com/minecraft/mc-mods", "page": "Safe vetted mods and resource packs with virus scanning.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://www.roblox.com/home", "page": "Roblox is an immersive platform for communication and connection.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://store.steampowered.com/genre/Free%20to%20Play", "page": "Browse the newest and most played free to play games on Steam.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://www.lego.com/en-us/kids", "page": "Play games, watch videos and build Lego creations.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://github.com/explore", "page": "Explore open source software and creative developer tools.", "pwd": 0, "label": 0, "category": "safe"},
    {"url": "https://www.chess.com/play/computer", "page": "Play chess against computer bots at your level.", "pwd": 0, "label": 0, "category": "safe"},

    # Malicious - Gaming Scams & Fake Currency Bait
    {"url": "http://free-minecraft-coins-999.xyz/claim?user=steve", "page": "Congratulations! You won 10,000 free coins. Enter username and password to claim immediately!", "pwd": 1, "label": 1, "category": "gaming_scams"},
    {"url": "http://roblox-free-robux-generator.top/verify.php", "page": "Unlimited Robux generator. Claim 50,000 Robux now! Limited time act now!", "pwd": 1, "label": 1, "category": "gaming_scams"},
    {"url": "http://fortnite-vbucks-giveaway.click/claim", "page": "Free V-Bucks for Fortnite! Enter your Epic password to confirm your prize.", "pwd": 1, "label": 1, "category": "gaming_scams"},
    {"url": "http://steamcommunity-giftcard-free.xyz/login", "page": "Claim your $50 Steam gift card. Enter your Steam credentials to receive gift.", "pwd": 1, "label": 1, "category": "gaming_scams"},
    {"url": "http://brawl-stars-unlimited-gems.buzz/hack", "page": "Download cheat engine and claim unlimited gems for Brawl Stars now.", "pwd": 0, "label": 1, "category": "gaming_scams"},
    {"url": "http://free-pokemon-go-coins.top/redeem?code=999", "page": "Congratulations! Claim your free Pokecoins within 5 minutes or offer expires.", "pwd": 1, "label": 1, "category": "gaming_scams"},
    {"url": "http://roblox.promo-codes-free-2026.click/claim", "page": "Secret developer promo codes for 100,000 Robux. Enter password to verify account.", "pwd": 1, "label": 1, "category": "gaming_scams"},
    {"url": "http://minecraft-free-diamond-generator.xyz/download", "page": "Get unlimited diamonds and netherite. Immediate action required.", "pwd": 0, "label": 1, "category": "gaming_scams"},

    # Malicious - Phishing & Fake Login Portals
    {"url": "http://192.168.1.105/roblox/login-verify.html", "page": "Your Roblox account is suspended! Enter your password immediately to unlock.", "pwd": 1, "label": 1, "category": "phishing"},
    {"url": "http://discord-nitro-gift-claim.xyz/login", "page": "You have been gifted 1 year of Discord Nitro! Confirm your password to accept.", "pwd": 1, "label": 1, "category": "phishing"},
    {"url": "http://account-security-update-google.top/signin", "page": "Immediate action required: account will be deleted unless password is verified.", "pwd": 1, "label": 1, "category": "phishing"},
    {"url": "http://steamcomunlty-safety-alert.xyz/trade", "page": "Someone reported your Steam account. Log in with password to avoid permanent ban.", "pwd": 1, "label": 1, "category": "phishing"},
    {"url": "http://appleid-support-icloud-verify.top/secure", "page": "Your Apple ID has been locked for security. Verify credentials right now.", "pwd": 1, "label": 1, "category": "phishing"},
    {"url": "http://microsoft-account-rewards-bonus.click/claim", "page": "Congratulations you won 10,000 Microsoft Points. Enter password to deposit.", "pwd": 1, "label": 1, "category": "phishing"},

    # Malicious - Suspicious Downloads & Malware Portals
    {"url": "http://free-minecraft-cheat-download.top/minecraft_aimbot.exe", "page": "Download free game hacks and cheats. Disable antivirus before running installer.", "pwd": 0, "label": 1, "category": "malicious_downloads"},
    {"url": "http://roblox-script-executor-free.xyz/setup.scr", "page": "Undetected Roblox script executor download. Run installer as administrator.", "pwd": 0, "label": 1, "category": "malicious_downloads"},
    {"url": "http://speed-booster-pc-optimizer.click/speed_up.bat", "page": "Double your computer gaming FPS. Click run to execute optimization script.", "pwd": 0, "label": 1, "category": "malicious_downloads"},
    {"url": "http://fortnite-skin-changer-v3.xyz/skins_installer.msi", "page": "Get all rare Fortnite skins for free. Download and launch installer.", "pwd": 0, "label": 1, "category": "malicious_downloads"}
]
