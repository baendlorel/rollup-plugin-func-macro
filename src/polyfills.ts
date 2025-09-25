String.prototype.replaceAll =
  String.prototype.replaceAll ||
  function (str: string, search: string, replacement: string): string {
    return typeof str.split(search).join(replacement);
  };
