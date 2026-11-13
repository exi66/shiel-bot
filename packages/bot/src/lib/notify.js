import { container } from "@sapphire/framework";

// Отправляет личное сообщение каждому из userIds. Ошибки (закрытые ЛС,
// удалённый аккаунт) глотаем — один пользователь не должен ломать рассылку.
// payload может быть функцией (user) => MessageCreateOptions.
export async function sendDirect(userIds, payload) {
  const { client } = container;
  let sent = 0;
  for (const userId of userIds) {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) continue;
    const message = typeof payload === "function" ? payload(user) : payload;
    const ok = await user.send(message).then(
      () => true,
      () => false,
    );
    if (ok) sent++;
  }
  return sent;
}
