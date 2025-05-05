import { Conf } from "electron-conf";
import {
  type ApplicationSettings,
  ConfFileName,
  createDefaultApplicationSettings,
} from "main/types";

export function ApplicationSettingsConf(): Conf<ApplicationSettings> {
  return new Conf<ApplicationSettings>({
    name: ConfFileName.ApplicationSettings,
    defaults: createDefaultApplicationSettings(),
  });
}
