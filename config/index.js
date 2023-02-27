const moment = require("moment");
currentDate = moment(
  JSON.stringify(new Date()),
  "YYYY-MM-DDTHH:mm:ss.SSSZ"
).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
module.exports = {
  options: {
    basePath: "/api", // It will set /management/info instead of /info
    infoGitMode: "full", // the amount of git information you want to expose, 'simple' or 'full',
    infoBuildOptions: null, // extra information you want to expose in the build object. Requires an object.
    infoDateFormat: null, // by default, git.commit.time will show as is defined in git.properties. If infoDateFormat is defined, moment will format git.commit.time. See https://momentjs.com/docs/#/displaying/format/.
    customEndpoints: [], // array of custom endpoints
  },

  morganOptions:
    '[:date[iso]] method=:method path=:url status=:status :remote-addr :remote-user :res[content-length] - :response-time ms ":user-agent"',
};
