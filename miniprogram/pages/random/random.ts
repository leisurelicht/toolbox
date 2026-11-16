Component({
  data: {
    min: 1,
    max: 100,
    count: 1,
    countOptions: [1, 2, 3, 5, 10],
    noDuplicates: false,
    results: [] as number[],
    rolling: false,
    history: [] as Array<{
      id: number;
      numbers: number[];
      min: number;
      max: number;
      time: string;
    }>,
    historyId: 0,
  },

  methods: {
    /* ========== 范围输入 ========== */
    onMinInput(e: WechatMiniprogram.Input) {
      const val = parseInt(e.detail.value, 10);
      if (!isNaN(val)) {
        this.setData({ min: val });
      }
    },

    onMinBlur(e: WechatMiniprogram.Input) {
      let val = parseInt(e.detail.value, 10);
      if (isNaN(val) || val > this.data.max) {
        val = this.data.min;
      }
      this.setData({ min: val });
    },

    onMaxInput(e: WechatMiniprogram.Input) {
      const val = parseInt(e.detail.value, 10);
      if (!isNaN(val)) {
        this.setData({ max: val });
      }
    },

    onMaxBlur(e: WechatMiniprogram.Input) {
      let val = parseInt(e.detail.value, 10);
      if (isNaN(val) || val < this.data.min) {
        val = this.data.max;
      }
      this.setData({ max: val });
    },

    onMinInc() {
      if (this.data.min < this.data.max) {
        this.setData({ min: this.data.min + 1 });
      }
    },

    onMinDec() {
      this.setData({ min: this.data.min - 1 });
    },

    onMaxInc() {
      this.setData({ max: this.data.max + 1 });
    },

    onMaxDec() {
      if (this.data.max > this.data.min) {
        this.setData({ max: this.data.max - 1 });
      }
    },

    /* ========== 生成数量 ========== */
    onCountChange(e: WechatMiniprogram.TouchEvent) {
      const count = (e.currentTarget.dataset as { count: number }).count;
      this.setData({ count, noDuplicates: count > 1 ? this.data.noDuplicates : false });
    },

    /* ========== 去重开关 ========== */
    onToggleDuplicates() {
      this.setData({ noDuplicates: !this.data.noDuplicates });
    },

    /* ========== 生成随机数 ========== */
    onGenerate() {
      const { min, max, count, noDuplicates } = this.data;

      if (min >= max) {
        wx.showToast({ title: '最小值需小于最大值', icon: 'none', duration: 1500 });
        return;
      }

      // 去重模式下检查范围是否足够
      if (noDuplicates && count > max - min + 1) {
        wx.showToast({
          title: '范围不足以生成不重复的数字',
          icon: 'none',
          duration: 1500,
        });
        return;
      }

      // 滚动动画
      this.setData({ rolling: true });
      const duration = 500;
      const interval = 50;
      const steps = Math.floor(duration / interval);
      let step = 0;

      const timer = setInterval(() => {
        const fakeResults: number[] = [];
        for (let i = 0; i < count; i++) {
          fakeResults.push(min + Math.floor(Math.random() * (max - min + 1)));
        }
        this.setData({ results: fakeResults });
        step++;
        if (step >= steps) {
          clearInterval(timer);

          // 生成最终结果
          const finalResults = this.generateNumbers(min, max, count, noDuplicates);
          this.setData({ results: finalResults, rolling: false });

          // 添加到历史
          this.addHistory(finalResults, min, max);

          // 触觉反馈
          wx.vibrateShort({ type: 'medium' });
        }
      }, interval);
    },

    /** 生成不重复随机数（Fisher-Yates 部分洗牌） */
    generateNumbers(min: number, max: number, count: number, noDuplicates: boolean): number[] {
      if (!noDuplicates || count === 1) {
        const results: number[] = [];
        for (let i = 0; i < count; i++) {
          results.push(min + Math.floor(Math.random() * (max - min + 1)));
        }
        return results;
      }

      // Fisher-Yates 部分洗牌：只洗前 count 个
      const pool: number[] = [];
      for (let i = min; i <= max; i++) {
        pool.push(i);
      }
      for (let i = 0; i < count; i++) {
        const j = i + Math.floor(Math.random() * (pool.length - i));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, count);
    },

    /* ========== 历史记录 ========== */
    addHistory(numbers: number[], min: number, max: number) {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const entry = {
        id: this.data.historyId,
        numbers,
        min,
        max,
        time,
      };
      const history = [entry, ...this.data.history].slice(0, 20); // 最多保留20条
      this.setData({ history, historyId: this.data.historyId + 1 });
    },

    onClearHistory() {
      wx.showModal({
        title: '清空记录',
        content: '确定要清空所有历史记录吗？',
        confirmColor: '#F76707',
        success: (res) => {
          if (res.confirm) {
            this.setData({ history: [] });
          }
        },
      });
    },

    /* ========== 复制结果 ========== */
    onCopyResult() {
      const { results } = this.data;
      if (results.length === 0) return;

      const text = results.join(', ');
      wx.setClipboardData({
        data: text,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success', duration: 1200 });
        },
      });
    },
  },
});