import { Player, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { mainMenu } from "../functions/mainMenu";

export class TagManager {
  public static getTags(player: Player): string[] {
    return player.getTags();
  }

  public static addTags(player: Player, tag: string): boolean {
    return player.addTag(tag);
  }

  public static hasTag(player: Player, tag: string): boolean {
    return player.hasTag(tag);
  }

  public static removeTag(player: Player, tag: string): boolean {
    return player.removeTag(tag);
  }
}

export class TagUIManager {
  public static openMainMenu(player: Player): void {
    const allPlayers = world.getAllPlayers();

    const modal = new ActionFormData()
      .title("Tag Management - Settings")
      .body("Select a player to manage their tags")
      .button("§c§lBack", "textures/ui/arrow_left");
    allPlayers.forEach((p) => modal.button(p.name));

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 0) return mainMenu(player);

      const selected = allPlayers[(r.selection as number) - 1];
      return TagUIManager.managePlayerMenu(player, selected);
    });
  }

  private static managePlayerMenu(player: Player, selectedPlayer: Player): void {
    const modal = new ActionFormData()
      .title(`${selectedPlayer.name} - Tag Management`)
      .button("List All Tags") // 0
      .button("Add Tag", "textures/ui/plus") // 1
      .button("Delete Tag", "textures/ui/trash") // 2
      .button("§c§lBack", "textures/ui/arrow_left"); // 3

    modal.show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 0:
          return TagUIManager.listAllTagsMenu(player, selectedPlayer);
        case 1:
          return TagUIManager.addTagMenu(player, selectedPlayer);
        case 2:
          return TagUIManager.deleteTagMenu(player, selectedPlayer);
        case 3:
          return TagUIManager.openMainMenu(player);
      }
    });
  }

  private static listAllTagsMenu(player: Player, selectedPlayer: Player): void {
    const playerTags = TagManager.getTags(selectedPlayer);
    const tags = playerTags ? playerTags : ["No tags were found"];

    const modal = new ActionFormData()
      .title(`${selectedPlayer.name} - Tags`)
      .button("§c§lBack", "textures/ui/arrow_left");
    tags.forEach((p) => modal.button(p));

    modal.show(player).then((r) => {
      if (r.canceled) return;
      return TagUIManager.managePlayerMenu(player, selectedPlayer);
    });
  }

  private static addTagMenu(player: Player, selectedPlayer: Player): void {
    const modal = new ModalFormData()
      .title(`${selectedPlayer.nameTag} - Add Tag`)
      .textField("Tag Name:", "Type here...")
      .submitButton("Click here to create");

    modal.show(player).then((r) => {
      if (r.canceled || !r.formValues) return;

      const [id] = r.formValues;
      const tag = String(id);

      if (TagManager.hasTag(selectedPlayer, tag))
        return player.sendMessage(`§e${selectedPlayer.name} §4already has the tag §e${tag}.`);

      const success = TagManager.addTags(selectedPlayer, tag);
      player.sendMessage(
        success ? `§aTag §e${tag}§a added successfully to §e${selectedPlayer.name}§a!` : "§4Failed to add tag."
      );
      return TagUIManager.managePlayerMenu(player, selectedPlayer);
    });
  }

  private static deleteTagMenu(player: Player, selectedPlayer: Player): void {
    const allTags = TagManager.getTags(selectedPlayer);
    const tags = allTags.length ? allTags : ["No tags were found"];

    const modal = new ModalFormData()
      .title(`${selectedPlayer.nameTag} - Delete Tag `)
      .dropdown("Select a tag to delete:", tags)
      .submitButton("Click here to delete");

    modal.show(player).then((r) => {
      if (r.canceled || !r.formValues) return;

      const index = Number(r.formValues);
      const tag = tags[index];

      if (!selectedPlayer.hasTag(tag))
        return player.sendMessage(`§e${selectedPlayer.name} §4does not have the §e${tag}§4 tag.`);

      const success = TagManager.removeTag(player, tag);
      player.sendMessage(
        success ? `§aTag §e${tag}§a removed successfully from §e${selectedPlayer.name}§a!` : "§4Failed to remove tag."
      );
      return TagUIManager.managePlayerMenu(player, selectedPlayer);
    });
  }
}
