const isActiveFlag = (flag) => {
  return flag.toLowerCase().includes("no") ? 1 : 0;
};

module.exports = { isActiveFlag };
