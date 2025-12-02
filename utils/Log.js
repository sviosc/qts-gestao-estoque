class Log {
    #logs = [];

    #addLog(log) { this.#logs.push(log) }

    addInfo(log) {
        this.#addLog({ type: 'Info', log: log });
    };
    addError(log) {
        this.#addLog({ type: 'Error', log: log })
    };
    addWarning(log) {
        this.#addLog({ type: 'Warning', log: log })
    };

    getAllLogs() { return [...this.#logs] }
}

module.exports = new Log()
