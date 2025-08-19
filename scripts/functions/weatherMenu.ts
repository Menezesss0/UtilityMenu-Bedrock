import { Player, WeatherType, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { mainMenu } from "./mainMenu";

export function weatherMenu(player: Player) {
  const modal = new ActionFormData()
    .title("§l§2U§6M§r | §1Weather §r- Settings")
    .button("§e§lClear", "textures/ui/weather_clear")
    .button("§9§lRain", "textures/ui/weather_rain")
    .button("§lThunder", "textures/ui/weather_thunderstorm")
    .button("§c§lBack", "textures/ui/arrow_left");

  modal.show(player).then((r) => {
    if (r.canceled) return;

    const weather = [
      { weather: WeatherType.Clear, name: "§eClear" },
      { weather: WeatherType.Rain, name: "§9Rain" },
      { weather: WeatherType.Thunder, name: "§7Thunder" },
    ];

    const selected = weather[r.selection as number];

    if (r.selection == 3) return mainMenu(player);

    if (selected) {
      try {
        world.getDimension("overworld").setWeather(selected.weather);
        player.sendMessage(`§aThe weather has been set to §l${selected.name}`);
        return weatherMenu(player);
      } catch {
        return player.sendMessage("§4An error occurred. Please try again later.");
      }
    }
  });
}
