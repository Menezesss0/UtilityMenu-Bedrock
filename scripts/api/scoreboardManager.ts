import {
  DisplaySlotId,
  Entity,
  Player,
  ScoreboardIdentity,
  ScoreboardObjective,
  ScoreboardObjectiveDisplayOptions,
  world,
} from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { mainMenu } from "../functions/mainMenu";

/**
 * @remarks Handles interactions related to scoreboards.
 */
export class ScoreboardManager {
  /**
   * @remarks
   * Creates a new scoreboard objective with the given ID and optional display name.
   */
  public static createObjective(objectiveId: string, display?: string): ScoreboardObjective {
    return display ? world.scoreboard.addObjective(objectiveId, display) : world.scoreboard.addObjective(objectiveId);
  }

  /**
   * @remarks
   * Retrieves an existing scoreboard objective by its ID.
   */
  public static getObjective(objectiveId: string): ScoreboardObjective | undefined {
    return world.scoreboard.getObjective(objectiveId);
  }

  /**
   * @remarks
   * Removes the specified scoreboard objective.
   */
  public static removeObjective(objectiveId: ScoreboardObjective | string): boolean {
    return world.scoreboard.removeObjective(objectiveId);
  }

  /**
   * @remarks
   * Sets an objective to a specific display slot on the UI.
   */
  public static setObjectiveAtDisplaySlot(
    displaySlotId: DisplaySlotId,
    objectiveDisplaySetting: ScoreboardObjectiveDisplayOptions
  ): ScoreboardObjective | undefined {
    return world.scoreboard.setObjectiveAtDisplaySlot(displaySlotId, objectiveDisplaySetting);
  }

  /**
   * @remarks
   * Retrieves the objective currently shown in a specific display slot.
   */
  public static getObjectiveAtDisplaySlot(displaySlotId: DisplaySlotId): ScoreboardObjectiveDisplayOptions | undefined {
    return world.scoreboard.getObjectiveAtDisplaySlot(displaySlotId);
  }

  /**
   * @remarks
   * Clears the objective shown in the specified display slot.
   */
  public static clearObjectiveAtDisplaySlot(displaySlotId: DisplaySlotId): ScoreboardObjective | undefined {
    return world.scoreboard.clearObjectiveAtDisplaySlot(displaySlotId);
  }

  /**
   * @remarks
   * Resets all display slots (Sidebar, BelowName, List) by clearing assigned objectives.
   */
  public static resetDisplaySlots(): boolean {
    const slots = [DisplaySlotId.Sidebar, DisplaySlotId.BelowName, DisplaySlotId.List];
    for (const slot of slots) {
      this.clearObjectiveAtDisplaySlot(slot);
    }
    return true;
  }

  /**
   * @remarks
   * Gets the score for a participant in a given scoreboard objective.
   */
  public static getScoreboard(
    scoreObjective: ScoreboardObjective,
    participant: Entity | ScoreboardIdentity | string
  ): number | undefined {
    return scoreObjective.getScore(participant);
  }

  /**
   * @remarks
   * Adds a specified amount to a participant’s current score.
   */
  public static addScoreboard(
    scoreObjective: ScoreboardObjective,
    participant: Entity | ScoreboardIdentity | string,
    scoreToAdd: number
  ): number | undefined {
    return scoreObjective.addScore(participant, scoreToAdd);
  }

  /**
   * @remarks
   * Removes a specified amount from a participant’s current score.
   */
  public static removeScoreboard(
    scoreObjective: ScoreboardObjective,
    participant: Entity | ScoreboardIdentity | string,
    scoreToRemove: number
  ): void {
    return scoreObjective.setScore(participant, this.getScoreboard(scoreObjective, participant) || 0 - scoreToRemove);
  }

  /**
   * @remarks
   * Lists all current objective IDs; returns a message if none are found.
   */
  public static listObjectives(): ScoreboardObjective[] | string[] {
    const scoreboards = world.scoreboard.getObjectives();
    return scoreboards.length ? scoreboards.map((objective) => objective.id) : ["No scoreboards were found."];
  }
}

/**
 * @remarks ScoreboardUIManager* Handles UI interactions related to scoreboards.
 */
export class ScoreboardUIManager {
  /**
   * @remarks Opens the main scoreboard menu for a player.
   * @param player The player opening the menu.
   */
  public static openMainMenu(player: Player): void {
    const modal = new ActionFormData()
      .title("§l§2U§6M§r | §2Scoreboard §r- Settings")
      .button("Manage Scoreboards") // 0
      .button("Create a Scoreboard", "textures/ui/plus") // 1
      .button("Delete a Scoreboard", "textures/ui/trash") // 2
      .button("Display Settings", "textures/ui/Envelope") // 3
      .button("§c§lBack", "textures/ui/arrow_left"); // 4

    modal.show(player).then((r) => {
      if (r.canceled) return;

      const menus = [
        ScoreboardUIManager.allScoreboardsMenu,
        ScoreboardUIManager.createMenu,
        ScoreboardUIManager.deleteMenu,
        ScoreboardUIManager.displaySettings,
        mainMenu,
      ];
      menus[r.selection as number](player);
    });
  }

  /**
   * @remarks Displays all scoreboards and allows player inspection.
   * @param player The player who triggered the menu.
   */
  private static allScoreboardsMenu(player: Player): void {
    const scoreboards = ScoreboardManager.listObjectives();

    const modal = new ActionFormData()
      .title("§l§2U§6M§r | All Scoreboards - Settings")
      .body("You can select a scoreboard to view players.")
      .button("§c§lBack", "textures/ui/arrow_left");
    scoreboards.forEach((name) => modal.button(name as string));

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 0) return ScoreboardUIManager.openMainMenu(player);

      const selected = scoreboards[(r.selection as number) - 1]; // -1 because of the back button
      const scoreboard = ScoreboardManager.getObjective(selected as string);

      if (!scoreboard) return player.sendMessage("§4The objective was not found.");
      return ScoreboardUIManager.playerMenu(player, scoreboard);
    });
  }

  /**
   * @remarks Displays options related to players in a scoreboard.
   * @param player The player who triggered the menu.
   * @param scoreboard The scoreboard object being inspected.
   */
  private static playerMenu(player: Player, scoreboard: ScoreboardObjective): void {
    if (!scoreboard) return player.sendMessage("§4The scoreboard does not exist.");

    const modal = new ActionFormData()
      .title(`§l§2U§6M§r | ${scoreboard.id} - Players`)
      .button("Add Player")
      .button("View players list")
      .button("§c§lBack", "textures/ui/arrow_left");

    modal.show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 0:
          return ScoreboardUIManager.addPlayerMenu(player, scoreboard.id);
        case 1:
          return ScoreboardUIManager.playerListMenu(player, scoreboard);
        case 2:
          return ScoreboardUIManager.allScoreboardsMenu(player);
      }
    });
  }

  /**
   * @remarks Opens menu to add a player to the scoreboard.
   * @param player The player who triggered the menu.
   * @param objectiveId The name of the scoreboard.
   */
  private static addPlayerMenu(player: Player, objectiveId: string): void {
    const allPlayers = world.getAllPlayers();
    const objective = ScoreboardManager.getObjective(objectiveId);

    if (!objective) return player.sendMessage(`Invalid objective.`);

    const participants = objective.getParticipants().map((p) => p.displayName);
    const availablePlayers = allPlayers.filter((p) => !participants.includes(p.nameTag)).map((p) => p.nameTag);

    if (availablePlayers.length === 0) return player.sendMessage("§eAll players are already added to this scoreboard.");

    const modal = new ModalFormData()
      .title(`§l§2U§6M§r | ${objectiveId} - Add Player`)
      .dropdown("Player:", availablePlayers)
      .textField("Value:", "Type here...");

    modal.show(player).then((r) => {
      if (r.canceled || !r.formValues) return;

      const [dropdownIndex, valueStr] = r.formValues as [number, string];
      const value = Number(valueStr);

      if (isNaN(value)) return player.sendMessage("§4Invalid number.");

      const selectedPlayer = allPlayers[dropdownIndex];

      try {
        objective.setScore(selectedPlayer, value);
        player.sendMessage("§aScore added successfully!");
        return ScoreboardUIManager.playerMenu(player, objective);
      } catch {
        return player.sendMessage("§4Failed to add score.");
      }
    });
  }

  /**
   * @remarks Shows a list of players recorded in the scoreboard.
   * @param player The player who triggered the menu.
   * @param scoreboard The scoreboard object being inspected.
   */
  private static playerListMenu(player: Player, scoreboard: ScoreboardObjective): void {
    const participants = scoreboard.getParticipants();
    const modal = new ActionFormData()
      .title(`§l§2U§6M§r | ${scoreboard.id} - Players`)
      .button("§c§lBack", "textures/ui/arrow_left");
    participants.forEach((p) => modal.button(p.displayName));

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 0) return ScoreboardUIManager.playerMenu(player, scoreboard);

      const selectedParticipant = participants[(r.selection as number) - 1]; // -1 because of the back button
      const participantValue = scoreboard.getScore(selectedParticipant);

      return ScoreboardUIManager.infoPlayersMenu(player, scoreboard, selectedParticipant, participantValue as number);
    });
  }

  /**
   * @remarks Displays and allows editing a player's score.
   * @param player The player who triggered the menu.
   * @param scoreboard The scoreboard being edited.
   * @param selectedParticipant The participant being edited.
   * @param value Current score.
   */
  private static infoPlayersMenu(
    player: Player,
    scoreboard: ScoreboardObjective,
    selectedParticipant: ScoreboardIdentity,
    participantValue: number
  ): void {
    const modal = new ModalFormData()
      .title(`§l§2U§6M§r | Info - ${selectedParticipant.displayName}`)
      .textField("Value:", `Place value here... (${participantValue})`);

    modal.show(player).then((r) => {
      if (r.canceled || !r.formValues) return;

      const [newValueStr] = r.formValues as string[];
      const value = Number(newValueStr);

      if (isNaN(value)) return player.sendMessage("§4Invalid number.");

      try {
        scoreboard.setScore(selectedParticipant, value);
        player.sendMessage("§aChanged successfully.");
        return ScoreboardUIManager.playerListMenu(player, scoreboard);
      } catch {
        return player.sendMessage("§4An error occurred. Please try again.");
      }
    });
  }

  /**
   * @remarks Opens the menu to create a new scoreboard.
   * @param player The player who triggered the menu.
   */
  private static createMenu(player: Player): void {
    const modal = new ModalFormData()
      .title("§l§2U§6M§r | Create Scoreboard - Settings")
      .textField("Objective Name:", "Type here...")
      .textField("Display Name:", "Type here...")
      .submitButton("Click here to create");

    modal.show(player).then((r) => {
      if (r.canceled || !r.formValues) return;

      const [id, display] = r.formValues as string[];

      const exists = ScoreboardManager.getObjective(id);
      if (exists) return player.sendMessage("§4Objective name already in use.");

      const created = ScoreboardManager.createObjective(id, display);
      player.sendMessage(created ? `§aObjective §e${id}§a created successfully.` : "§4Failed to create objective.");
      return ScoreboardUIManager.openMainMenu(player);
    });
  }

  /**
   * @remarks Opens the menu to delete an existing scoreboard.
   * @param player The player who triggered the menu.
   */
  private static deleteMenu(player: Player): void {
    const scoreboards = ScoreboardManager.listObjectives() as string[];
    const modal = new ModalFormData()
      .title("§l§2U§6M§r | Delete Scoreboard - Settings")
      .dropdown("Select a scoreboard to delete:", scoreboards)
      .submitButton("Click here to delete");

    modal.show(player).then((r) => {
      if (r.canceled || !r.formValues) return;

      const index = r.formValues[0] as number;
      const objective = scoreboards[index];

      const exists = ScoreboardManager.getObjective(objective);
      if (!exists) return player.sendMessage("§4Failed to delete objective.");

      ScoreboardManager.removeObjective(objective);
      player.sendMessage(`§aObjective §e${objective}§a deleted successfully.`);
      return ScoreboardUIManager.openMainMenu(player);
    });
  }

  /**
   * @remarks Shows the display settings menu for scoreboards.
   * @param player The player who triggered the menu.
   */
  private static displaySettings(player: Player): void {
    const modal = new ActionFormData()
      .title("§l§2U§6M§r | Scoreboard Display - Settings")
      .body("Select an option.")
      .button("Reset display settings")
      .button("View the list of scoreboards")
      .button("§c§lBack", "textures/ui/arrow_left");

    modal.show(player).then((r) => {
      if (r.canceled) return;
      switch (r.selection) {
        case 0:
          const reset = ScoreboardManager.resetDisplaySlots();
          player.sendMessage(reset ? "§aSuccessfully reset display settings!" : "§4Failed to reset display settings.");
          return ScoreboardUIManager.displaySettings(player);
        case 1:
          return ScoreboardUIManager.displayList(player);
        case 2:
          return ScoreboardUIManager.openMainMenu(player);
      }
    });
  }

  /**
   * @remarks Displays a list of scoreboards to set display slot.
   * @param player The player who triggered the menu.
   */
  private static displayList(player: Player): void {
    const scoreboards = ScoreboardManager.listObjectives();
    const modal = new ActionFormData()
      .title("§l§2U§6M§r | Scoreboard Display List")
      .body("Select a scoreboard to modify display settings.")
      .button("§c§lBack", "textures/ui/arrow_left");

    scoreboards.forEach((scoreboard) => modal.button(scoreboard as string));

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 0) return ScoreboardUIManager.displaySettings(player);

      const objective = scoreboards[(r.selection as number) - 1]; // -1 because of the back button

      if (!objective) return player.sendMessage("§4Invalid objective.");
      return ScoreboardUIManager.displaySlotMenu(player, objective as string);
    });
  }

  /**
   * @remarks Menu to choose where a scoreboard should be displayed.
   * @param player The player who triggered the menu.
   * @param objectiveId Scoreboard ID.
   */
  private static displaySlotMenu(player: Player, objectiveId: string) {
    const modal = new ActionFormData()
      .title(`§l§2U§6M§r | ${objectiveId} - Display`)
      .button("SideBar")
      .button("List")
      .button("BelowName")
      .button("§c§lBack", "textures/ui/arrow_left");

    modal.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection == 3) return ScoreboardUIManager.displayList(player);

      const slots = [DisplaySlotId.Sidebar, DisplaySlotId.List, DisplaySlotId.BelowName];
      const objective = ScoreboardManager.getObjective(objectiveId);

      if (!objective) return player.sendMessage("§4Invalid objective.");

      try {
        ScoreboardManager.setObjectiveAtDisplaySlot(slots[r.selection as number], {
          objective: objective,
        });
        player.sendMessage("§aDisplayed successfully!");
        return ScoreboardUIManager.displaySlotMenu(player, objectiveId);
      } catch {
        return player.sendMessage("§4Failed to set display.");
      }
    });
  }
}
