class Settings {

  keyBase: string | null = null;

  constructor(keyBase: string | null = null) {
    this.keyBase = keyBase;
  }

  generateKey(id: string) {
    return this.keyBase ? [this.keyBase, `id${id}`].join('.') : id;
  }

  set(id: string, data: any) {
    const key = this.generateKey(id);
    try {
      const encodedData = JSON.stringify(data);
      localStorage.setItem(key, encodedData);
      return data;
    } catch (e) {
      return null;
    }
  }

  get(id: string) {
    const key = this.generateKey(id);
    try {
      const rawData = localStorage.getItem(key);
      return rawData ? JSON.parse(rawData) : null;
    } catch (e) {
      return null;
    }
  }

  remove(id: string) {
    const data = this.get(id);
    if (data) {
      const key = this.generateKey(id);
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Do nothing
      }
    }
    return data;
  }

}

/** Remember push notification settings. */
const pushNotificationsSetting = new Settings('plfe_push_notification_data');

/** Remember hashtag usage. */
const tagHistory = new Settings('plfe_tag_history');

export {
  pushNotificationsSetting,
  tagHistory,
  Settings as default,
};
