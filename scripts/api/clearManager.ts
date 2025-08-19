import { EntityComponentTypes, ItemStack, Player } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { mainMenu } from "../functions/mainMenu";
import { MinecraftCameraPresetsTypes } from "@minecraft/vanilla-data";

export class ClearUIManager {
  public static openMainMenu(player: Player) {
    const modal = new ActionFormData()
      .title("Clear Menu - Settings")
      .button("Inventory", "textures/ui/inventory_icon") // 0
      .button("Camera", "textures/ui/camera-yo") // 1
      .button("Chat", "textures/ui/chat_send") // 2
      .button("§c§lBack", "textures/ui/arrow_left"); // 3

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 3) return mainMenu(player);
      const menus = [ClearUIManager.clearInventory, ClearUIManager.clearCamera, ClearUIManager.clearChat];
      return menus[r.selection as number](player);
    });
  }

  private static clearInventory(player: Player) {
    const modal = new MessageFormData()
      .title("Clear Inventory")
      .body("Are you sure you want to clear your entire inventory? \n\n§4§lThis action cannot be undone.")
      .button1("Cancel") // 0
      .button2("Yes"); // 1

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 0) return ClearUIManager.openMainMenu(player);

      try {
        const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container;
        inventory?.clearAll();
        inventory?.setItem(0, new ItemStack("minecraft:compass"));
        player.sendMessage("§aYour inventory has been successfully cleared.");
        return ClearUIManager.openMainMenu(player);
      } catch {
        return player.sendMessage("§4An error occurred while clearing the inventory. Please try again later.");
      }
    });
  }

  private static clearCamera(player: Player) {
    const modal = new MessageFormData()
      .title("Clear Camera")
      .body("Are you sure you want to clear your camera? \n\n§4§lThis action cannot be undone.")
      .button1("Cancel") // 0
      .button2("Yes"); // 1

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 0) return ClearUIManager.openMainMenu(player);

      try {
        player.camera.clear();
        player.sendMessage("§aYour camera has been successfully cleared.");
        return ClearUIManager.openMainMenu(player);
      } catch {
        return player.sendMessage("§4An error occurred while clearing the camera. Please try again later.");
      }
    });
  }

  private static clearChat(player: Player) {
    const modal = new MessageFormData()
      .title("Clear Chat")
      .body("Are you sure you want to clear your chat? \n\n§4§lThis action cannot be undone.")
      .button1("Cancel") // 0
      .button2("Yes"); // 1

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 0) return ClearUIManager.openMainMenu(player);

      try {
        player.sendMessage("\n".repeat(100));
        player.sendMessage("§aYour chat has been successfully cleared.");
        return ClearUIManager.openMainMenu(player);
      } catch {
        return player.sendMessage("§4An error occurred while clearing the chat. Please try again later.");
      }
    });
  }
}

/*export function clearConfirmationMenu(player: Player) {
  const modal = new MessageFormData()
    .title("Clear Inventory")
    .body("Are you sure you want to clear your entire inventory? \n\n§4§lThis action cannot be undone.")
    .button2("Yes")
    .button1("Cancel");

  modal.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 1:
        try {
          const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container;

          inventory?.clearAll();
          inventory?.setItem(0, new ItemStack("minecraft:compass"));
          return player.sendMessage("§aYour inventory has been successfully cleared.");
        } catch {
          return player.sendMessage("§4An error occurred. Please try again later.");
        }
    }
  });
}
*/
