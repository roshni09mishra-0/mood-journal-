# Mood Journal with AI Insights

Yeh ek simple front-end web app hai jo daily mood patterns track karne ke liye bana hai.

## Included features

- Daily mood selection
- Notes section
- Mood history calendar
- Weekly AI-style summary based on saved entries
- Beautiful charts for recent trend and mood mix
- Dynamic background jo mood ke hisaab se change hota hai

## Kaise use karein

1. Browser me `index.html` open karein.
2. Aaj ka mood select karein.
3. Agar chaho to notes likhein.
4. `Aaj ka mood save karo` button par click karein.

Entries browser `localStorage` me save hoti hain, isliye same browser me dubara mil jayengi.

## GitHub se Vercel auto deploy

1. Is project ko GitHub repo me push karo.
2. Vercel dashboard open karo aur `Add New Project` select karo.
3. Apna GitHub account connect karo.
4. `mood-journal-aap` ya jis repo me yeh project push kiya ho, usse import karo.
5. Framework preset ko `Other` ya static project hi rehne do.
6. Root directory `/` rehne do.
7. Deploy par click karo.

Uske baad har naya `git push` automatically Vercel par deploy ho jayega.

## Next upgrade ideas

- Real AI summary with OpenAI ya Gemini API
- User authentication
- Multiple journals per user
- Export to PDF ya CSV
- Reminders aur notifications
