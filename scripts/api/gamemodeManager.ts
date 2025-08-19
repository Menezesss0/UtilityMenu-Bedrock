import { GameMode, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { mainMenu } from "../functions/mainMenu";

/**
 * @remarks
 * GamemodeManager
 * Handles getting and setting player gamemodes.
 */
export class GamemodeManager {
  /**
   * @remarks
   * Sets the gamemode for a given player.
   * @param player
   * The player whose gamemode will be changed.
   * @param gamemode
   * The gamemode to apply.
   * @returns
   * True if successful, false otherwise.
   */
  public static setGameMode(player: Player, gamemode: GameMode): boolean {
    try {
      player.setGameMode(gamemode);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @remarks
   * Retrieves the current gamemode of a player.
   *
   * @param player
   * The player to check.
   * @returns
   * The player's current gamemode.
   */
  public static getGameMode(player: Player): GameMode {
    return player.getGameMode();
  }
}

/**
 * @remarks
 * GamemodeUiManager
 * Handles the UI for gamemode selection and changes.
 */
export class GamemodeUiManager {
  /**
   * @remarks
   * Opens the main gamemode selection menu for a player.
   *
   * @param player
   * The player who will see the menu.
   */
  public static openMainMenu(player: Player): void {
    const modal = new ActionFormData()
      .title("§l§2U§6M§r | §1Gamemode§r - Settings")
      .body("Select a gamemode to switch to.")
      .button("Creative", "textures/ui/hardcore/absorption_heart") // 0
      .button("Survival", "textures/ui/hardcore/heart") // 1
      .button("Adventure", "textures/ui/strength_effect") // 2
      .button("Spectator", "textures/ui/world_glyph_color_2x") // 3
      .button("§c§lBack", "textures/ui/arrow_left"); // 4

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 4) return mainMenu(player);

      const gamemodes = [
        { mode: GameMode.creative, name: "Creative" },
        { mode: GameMode.survival, name: "Survival" },
        { mode: GameMode.adventure, name: "Adventure" },
        { mode: GameMode.spectator, name: "Spectator" },
      ];
      const selectedGameMode = gamemodes[r.selection as number];

      if (GamemodeManager.getGameMode(player) == selectedGameMode.mode)
        return player.sendMessage("§eYou are already in the selected gamemode.");

      const success = GamemodeManager.setGameMode(player, selectedGameMode.mode);
      player.sendMessage(
        success
          ? `§aThe gamemode was successfully changed to ${selectedGameMode.name}`
          : "§4Failed to change gamemode."
      );
      return GamemodeUiManager.openMainMenu(player)
    });
  }
}
