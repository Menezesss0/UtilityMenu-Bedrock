import { world } from "@minecraft/server";
import { mainMenu } from "./functions/mainMenu";

/* CREDITS:
- Menezesss0: Code and development
- yPerfectBR, Thini, Wendrew: Ideas and suggestions to improve the addon
- Jackie Weyland: Helped enhance the pixel art of the addon logo

Note: this is beginner-level code, so please be kind!  
Language: TypeScript
*/

world.afterEvents.itemUse.subscribe(({ itemStack, source }) => {
  if (itemStack.typeId == "minecraft:compass" && source.hasTag("utilitymenu-adm")) return mainMenu(source);
});
