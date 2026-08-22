import { Buffer } from 'buffer';

// @ton/core (TonConnect-транзакции, см. lib/ton.ts) рассчитан на глобальный
// Buffer как в Node — Vite его в браузер не полифиллит сам, без этого TON
// Connect падает ReferenceError'ом при самой инициализации ДО первого рендера
// (см. диалог "MiniApp не открывается") и роняет всё приложение молча.
//
// Важно: это ДОЛЖЕН быть первый import в main.tsx, раньше './App' — ES-модули
// выполняют импорты в порядке объявления, а App тянет за собой весь дерево
// TonConnect, которое читает Buffer на этапе загрузки модуля, ещё до того, как
// успел бы отработать код в теле самого main.tsx.
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

window.Buffer = window.Buffer ?? Buffer;
