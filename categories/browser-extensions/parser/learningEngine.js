/**
 * 学习引擎 - learningEngine.js
 * 用户反馈纠错系统，记录并学习用户的纠错行为
 */

const LearningEngine = {
  STORAGE_KEY: 'siteCorrections',
  DEFAULT_CONFIDENCE: 0.5,
  CONFIDENCE_INCREMENT: 0.2,
  CONFIDENCE_DECREMENT: 0.3,

  /**
   * 获取站点纠错数据
   */
  async getCorrections() {
    const result = await chrome.storage.local.get([this.STORAGE_KEY]);
    return result[this.STORAGE_KEY] || {};
  },

  /**
   * 保存站点纠错数据
   */
  async saveCorrections(corrections) {
    await chrome.storage.local.set({ [this.STORAGE_KEY]: corrections });
  },

  /**
   * 记录正确映射
   * @param {string} site - 站点域名
   * @param {string} elementId - 元素标识
   * @param {string} fieldType - 字段类型
   * @param {string} fieldValue - 字段值
   */
  async recordCorrectMapping(site, elementId, fieldType, fieldValue) {
    const corrections = await this.getCorrections();

    if (!corrections[site]) {
      corrections[site] = {};
    }

    if (!corrections[site][elementId]) {
      corrections[site][elementId] = {
        correctField: fieldType,
        correctValue: fieldValue,
        wrongMappings: [],
        lastUsed: new Date().toISOString().split('T')[0],
        confidence: this.DEFAULT_CONFIDENCE + this.CONFIDENCE_INCREMENT
      };
    } else {
      corrections[site][elementId].correctField = fieldType;
      corrections[site][elementId].correctValue = fieldValue;
      corrections[site][elementId].lastUsed = new Date().toISOString().split('T')[0];
      corrections[site][elementId].confidence = Math.min(
        1.0,
        (corrections[site][elementId].confidence || this.DEFAULT_CONFIDENCE) + this.CONFIDENCE_INCREMENT
      );
    }

    await this.saveCorrections(corrections);
  },

  /**
   * 记录错误映射
   * @param {string} site - 站点域名
   * @param {string} elementId - 元素标识
   * @param {string} wrongField - 错误的字段类型
   * @param {string} correctField - 正确的字段类型
   */
  async recordWrongMapping(site, elementId, wrongField, correctField) {
    const corrections = await this.getCorrections();

    if (!corrections[site]) {
      corrections[site] = {};
    }

    if (!corrections[site][elementId]) {
      corrections[site][elementId] = {
        correctField: correctField,
        wrongMappings: [],
        lastUsed: new Date().toISOString().split('T')[0],
        confidence: this.DEFAULT_CONFIDENCE - this.CONFIDENCE_DECREMENT
      };
    }

    // 添加到错误映射列表
    if (!corrections[site][elementId].wrongMappings.includes(wrongField)) {
      corrections[site][elementId].wrongMappings.push(wrongField);
    }

    // 降低置信度
    corrections[site][elementId].confidence = Math.max(
      0,
      corrections[site][elementId].confidence - this.CONFIDENCE_DECREMENT
    );

    await this.saveCorrections(corrections);
  },

  /**
   * 获取站点的最佳映射
   * @param {string} site - 站点域名
   * @param {string} elementId - 元素标识
   * @returns {Object|null} 最佳映射信息
   */
  async getBestMapping(site, elementId) {
    const corrections = await this.getCorrections();

    if (corrections[site] && corrections[site][elementId]) {
      const mapping = corrections[site][elementId];

      // 如果置信度太低，不返回
      if (mapping.confidence < 0.2) {
        return null;
      }

      return {
        fieldType: mapping.correctField,
        value: mapping.correctValue,
        confidence: mapping.confidence,
        wrongFields: mapping.wrongMappings
      };
    }

    return null;
  },

  /**
   * 获取站点的所有高置信度映射
   * @param {string} site - 站点域名
   * @returns {Object} 高置信度映射集合
   */
  async getHighConfidenceMappings(site) {
    const corrections = await this.getCorrections();
    const result = {};

    if (corrections[site]) {
      for (const [elementId, mapping] of Object.entries(corrections[site])) {
        if (mapping.confidence >= 0.6) {
          result[elementId] = {
            fieldType: mapping.correctField,
            confidence: mapping.confidence
          };
        }
      }
    }

    return result;
  },

  /**
   * 检查字段是否被标记为错误
   * @param {string} site - 站点域名
   * @param {string} elementId - 元素标识
   * @param {string} fieldType - 字段类型
   * @returns {boolean}
   */
  async isFieldMarkedAsWrong(site, elementId, fieldType) {
    const corrections = await this.getCorrections();

    if (corrections[site] && corrections[site][elementId]) {
      return corrections[site][elementId].wrongMappings.includes(fieldType);
    }

    return false;
  },

  /**
   * 获取站点的映射统计
   * @param {string} site - 站点域名
   * @returns {Object} 统计信息
   */
  async getSiteStats(site) {
    const corrections = await this.getCorrections();

    if (!corrections[site]) {
      return {
        totalMappings: 0,
        highConfidenceCount: 0,
        averageConfidence: 0
      };
    }

    const mappings = Object.values(corrections[site]);
    const highConfidence = mappings.filter(m => m.confidence >= 0.6).length;
    const totalConfidence = mappings.reduce((sum, m) => sum + (m.confidence || 0), 0);

    return {
      totalMappings: mappings.length,
      highConfidenceCount: highConfidence,
      averageConfidence: mappings.length > 0 ? (totalConfidence / mappings.length).toFixed(2) : 0
    };
  },

  /**
   * 清除站点的所有纠错数据
   * @param {string} site - 站点域名
   */
  async clearSiteCorrections(site) {
    const corrections = await this.getCorrections();

    if (corrections[site]) {
      delete corrections[site];
      await this.saveCorrections(corrections);
    }
  },

  /**
   * 重置所有纠错数据
   */
  async resetAllCorrections() {
    await chrome.storage.local.remove(this.STORAGE_KEY);
  },

  /**
   * 导出纠错数据
   * @returns {string} JSON 格式的纠错数据
   */
  async exportCorrections() {
    const corrections = await this.getCorrections();
    return JSON.stringify(corrections, null, 2);
  },

  /**
   * 导入纠错数据
   * @param {string} jsonString - JSON 格式的纠错数据
   */
  async importCorrections(jsonString) {
    try {
      const corrections = JSON.parse(jsonString);
      await this.saveCorrections(corrections);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 导出到全局
window.LearningEngine = LearningEngine;