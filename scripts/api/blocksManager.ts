import { EntityComponentTypes, ItemStack, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { mainMenu } from "../functions/mainMenu";

export class BlocksUIManager {
  public static openMainMenu(player: Player): void {
    const modal = new ActionFormData()
      .title("§l§2U§6M§r | §9Creative Blocks §r- Settings")
      .button("Command Block", "textures/blocks/command_block_side_mipmap") // 0
      .button("Light Block", "textures/items/light_block_15") // 1
      .button("Barrier", "textures/blocks/barrier") // 2
      .button("Structure Block", "textures/blocks/structure_block") // 3
      .button("Structure Void", "textures/blocks/structure_void") // 4
      .button("Border Block", "textures/blocks/border") // 5
      .button("Jigsaw", "textures/blocks/jigsaw_front") // 6
      .button("Allow", "textures/blocks/build_allow") // 7
      .button("Deny", "textures/blocks/build_deny") // 8
      .button("§c§lBack", "textures/ui/arrow_left"); // 9

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 9) return mainMenu(player);

      const blocks = [
        { name: "Command Block", action: () => BlocksUIManager.commandBlockMenu(player) },
        { name: "Light Block", action: () => BlocksUIManager.lightBlockMenu(player) },
        { name: "Barrier", block: "minecraft:barrier" },
        { name: "Structure Block", block: "minecraft:structure_block" },
        { name: "Structure Void", block: "minecraft:structure_void" },
        { name: "Border Block", block: "minecraft:border_block" },
        { name: "Jigsaw Block", block: "minecraft:jigsaw" },
        { name: "Allow", block: "minecraft:allow" },
        { name: "Deny", block: "minecraft:deny" },
      ];

      const selected = blocks[r.selection as number];

      if (selected.action) return selected.action();

      const inventory = player.getComponent(EntityComponentTypes.Inventory);
      inventory?.container?.addItem(new ItemStack(selected.block, 1));

      player.sendMessage(`§aYou received §e${selected.name}`);
      return BlocksUIManager.openMainMenu(player); // ta dando erro
    });
  }

  private static commandBlockMenu(player: Player): void {
    const modal = new ActionFormData()
      .title("§l§2U§6M§r | §9Command_Block §r- Settings")
      .button("Impulse", "textures/blocks/command_block_side_mipmap") // 0
      .button("Chain", "textures/blocks/chain_command_block_side_mipmap") // 1
      .button("Repeating", "textures/blocks/repeating_command_block_side_mipmap") // 2
      .button("§c§lBack", "textures/ui/arrow_left"); // 3

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 3) return this.openMainMenu(player);

      const blocks = [
        { name: "Command Block (impulse)", block: "minecraft:command_block" },
        { name: "Command Block (chain)", block: "minecraft:chain_command_block" },
        { name: "Command Block (repeating)", block: "minecraft:repeating_command_block" },
      ];

      const inventory = player.getComponent(EntityComponentTypes.Inventory);
      const selected = blocks[r.selection as number];

      inventory?.container?.addItem(new ItemStack(selected.block));
      player.sendMessage(`§aYou received §e${selected.name}`);
      return this.openMainMenu(player);
    });
  }

  private static lightBlockMenu(player: Player): void {
    const modal = new ActionFormData()
      .title("§l§2U§6M§r | §9Light Block Intensity §r- Settings")
      .button("15", "textures/items/light_block_15") // 0
      .button("14", "textures/items/light_block_14") // 1
      .button("13", "textures/items/light_block_13") // 2
      .button("12", "textures/items/light_block_12") // 3
      .button("11", "textures/items/light_block_11") // 4
      .button("10", "textures/items/light_block_10") // 5
      .button("9", "textures/items/light_block_9") // 6
      .button("8", "textures/items/light_block_8") // 7
      .button("7", "textures/items/light_block_7") // 8
      .button("6", "textures/items/light_block_6") // 9
      .button("5", "textures/items/light_block_5") // 10
      .button("4", "textures/items/light_block_4") // 11
      .button("3", "textures/items/light_block_3") // 12
      .button("2", "textures/items/light_block_2") // 13
      .button("1", "textures/items/light_block_1") // 14
      .button("0", "textures/items/light_block_0") // 15
      .button("§c§lBack", "textures/ui/arrow_left"); // 16

    modal.show(player).then((r) => {
      if (r.canceled || typeof r.selection !== "number") return;
      if (r.selection == 16) return this.openMainMenu(player);

      const inventory = player.getComponent(EntityComponentTypes.Inventory);
      const intensity = 15 - r.selection;

      inventory?.container?.addItem(new ItemStack(`minecraft:light_block_${intensity}`));

      player.sendMessage(`§aYou received §eLight Block ${intensity}`);
      return this.openMainMenu(player);
    });
  }
}
