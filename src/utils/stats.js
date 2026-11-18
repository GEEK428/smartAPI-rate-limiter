const stats = {
  totalRequests: 0,
  allowedRequests: 0,
  blockedRequests: 0,
  activeBucketsProvider: () => 0,

  recordAllowed() {
    this.totalRequests += 1;
    this.allowedRequests += 1;
  },

  recordBlocked() {
    this.totalRequests += 1;
    this.blockedRequests += 1;
  },

  setActiveBucketsProvider(provider) {
    this.activeBucketsProvider = provider;
  },

  snapshot() {
    return {
      totalRequests: this.totalRequests,
      allowedRequests: this.allowedRequests,
      blockedRequests: this.blockedRequests,
      activeBuckets: this.activeBucketsProvider()
    };
  },

  reset() {
    this.totalRequests = 0;
    this.allowedRequests = 0;
    this.blockedRequests = 0;
    this.activeBucketsProvider = () => 0;
  }
};

module.exports = stats;
