import { Conf } from "electron-conf";
import {
  type ApplicationSettings,
  ConfFileName,
  createDefaultApplicationSettings,
} from "main/types";
import {
  createPersistedApiKeysState,
  type PersistedApiKeysState,
} from "shared/ApiKeysType";

export function ApplicationSettingsConf(): Conf<ApplicationSettings> {
  return new Conf<ApplicationSettings>({
    name: ConfFileName.ApplicationSettings,
    defaults: createDefaultApplicationSettings(),
  });
}

export function ApiKeysConf(): Conf<PersistedApiKeysState> {
  return new Conf<PersistedApiKeysState>({
    name: ConfFileName.ApiKeys,
    defaults: createPersistedApiKeysState(),
  });
}
