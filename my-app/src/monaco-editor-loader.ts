// This tells Monaco where to load web workers from
(window as any).MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: any, label: string) {
      return 'assets/vs/base/worker/workerMain.js';
    }
  };
  