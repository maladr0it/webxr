type Log = {
  content: string;
};

const log_create = () => {
  return {
    content: "",
  };
};

export const log_write = (log: Log, ...data: any[]) => {
  for (let i = 0; i < data.length; ++i) {
    log.content += `${data[i]} `;
  }
  log.content += "\n";
};

export const log_clear = (log: Log) => {
  log.content = "";
};

// export log as a singleton for convenience
export const log = log_create();

export const frameLog = log_create();
