import app from "./app";
import { applicationConfig } from "./api/helpers/config/app.config";
import connectDb from "./api/helpers/config/dbConfig";
import { consoleLogger } from "./api/helpers/utils/componentLogger";
import customErrorLogger from "./api/helpers/utils/errCustomLogger";

const Port = applicationConfig.PORT;

(async () => {
  try {
    await connectDb(process.env.MONGO_URL!);
    app.listen(Port, () =>
      consoleLogger.info(`Server listening on http:\//localhost:${Port}`)
    );
  } catch (err: Error | any) {
    customErrorLogger.error(err.message);
    process.exit(1);
  }
})();
