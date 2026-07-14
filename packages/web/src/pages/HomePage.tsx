import { buttonVariants } from "@/components/ui/button";

const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${__DISCORD_CLIENT_ID__}&permissions=2147551232&integration_type=0&scope=bot`;

// Плейсхолдер главной страницы — позже здесь появится информация о боте.
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
      <div className="mx-auto max-w-lg text-center space-y-4">
        <h1 className="text-3xl font-bold">shiel-bot</h1>
        <p className="text-muted-foreground">
          Discord-бот для отслеживания регистрации редких предметов на аукционе
          Black Desert Online и уведомлений о новых купонах.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className={`${buttonVariants()} w-full`}
          >
            Добавить бота
          </a>
          <a
            href={__GIT_URL__}
            target="_blank"
            rel="noreferrer"
            className={`${buttonVariants({ variant: "outline" })} w-full`}
          >
            Git
          </a>
        </div>
      </div>
    </div>
  );
}
