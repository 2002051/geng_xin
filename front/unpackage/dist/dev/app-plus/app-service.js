if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const request = (options) => {
    const defaultOptions = {
      timeout: 2e3,
      header: {
        "Content-Type": "application/json"
      }
    };
    return new Promise((resolve, reject) => {
      uni.request({
        ...defaultOptions,
        ...options,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        },
        fail: (err) => {
          formatAppLog("log", "at utils/request.js:21", "request:", "请求失败");
          reject(err);
        }
      });
    });
  };
  const cfg = {
    "media_url": "http://192.168.101.5:80000",
    "base_url": "http://192.168.101.5:8000",
    // "media_url" : "http://127.0.0.1:8000",
    // "base_url" : "http://127.0.0.1:8000",
    "login_logo": "gx"
    // 登录界面logo艺术字;
  };
  const _imports_0$1 = "/static/empty-album.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$5 = {
    data() {
      return {
        albumList: [],
        loading: false,
        refreshing: false,
        page: 1,
        pageSize: 10,
        hasMore: true,
        loadMoreStatus: "more"
      };
    },
    onLoad() {
      this.loadAlbums();
    },
    onPullDownRefresh() {
      this.onRefresh();
    },
    onReachBottom() {
      if (this.hasMore && !this.loading) {
        this.loadMore();
      }
    },
    methods: {
      async loadAlbums(isRefresh = false) {
        if (this.loading)
          return;
        this.loading = true;
        if (isRefresh) {
          this.refreshing = true;
          this.page = 1;
          this.hasMore = true;
        }
        try {
          const token = uni.getStorageSync("token");
          if (!token) {
            uni.navigateTo({
              url: "/pages/login/login"
            });
            return;
          }
          const params = {
            page: this.page,
            page_size: this.pageSize
          };
          const result = await request({
            url: `${cfg.base_url}/album/list`,
            method: "GET",
            header: {
              "token": `${token}`,
              "Content-Type": "application/json"
            },
            data: params,
            timeout: 1e4
          });
          formatAppLog("log", "at pages/index/index.vue:166", "获取相册成功:", result);
          if (isRefresh) {
            this.albumList = result.results || result;
          } else {
            this.albumList = [...this.albumList, ...result.results || result];
          }
          this.hasMore = result.next !== null && result.next !== void 0;
        } catch (err) {
          formatAppLog("error", "at pages/index/index.vue:178", "获取失败:", err);
          uni.showToast({
            title: "加载失败",
            icon: "error"
          });
        } finally {
          this.loading = false;
          this.refreshing = false;
          uni.stopPullDownRefresh();
        }
      },
      onRefresh() {
        this.loadAlbums(true);
      },
      async loadMore() {
        if (!this.hasMore || this.loading)
          return;
        this.loadMoreStatus = "loading";
        this.page++;
        try {
          await this.loadAlbums();
        } finally {
          this.loadMoreStatus = this.hasMore ? "more" : "noMore";
        }
      },
      goToAlbum(albumId) {
        uni.navigateTo({
          url: `/pages/detailPic/detailPic?id=${albumId}`,
          animationType: "slide-in-right"
        });
      },
      createAlbum() {
        uni.showModal({
          title: "新建相册",
          content: "请输入相册名称",
          editable: true,
          placeholderText: "相册名称",
          success: async (res) => {
            if (res.confirm && res.content.trim()) {
              try {
                const token = uni.getStorageSync("token");
                const result = await request({
                  url: `${cfg.base_url}/albums/`,
                  method: "POST",
                  header: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                  },
                  data: {
                    name: res.content.trim(),
                    detail: "",
                    is_public: true
                  }
                });
                uni.showToast({
                  title: "创建成功",
                  icon: "success"
                });
                setTimeout(() => {
                  this.goToAlbum(result.id);
                }, 1500);
              } catch (error) {
                formatAppLog("error", "at pages/index/index.vue:249", "创建失败:", error);
                uni.showToast({
                  title: "创建失败",
                  icon: "error"
                });
              }
            }
          }
        });
      },
      formatDate(dateString) {
        if (!dateString)
          return "";
        const date = new Date(dateString);
        const now = /* @__PURE__ */ new Date();
        const diffDays = Math.floor((now - date) / (1e3 * 60 * 60 * 24));
        if (diffDays === 0)
          return "今天";
        if (diffDays === 1)
          return "昨天";
        if (diffDays < 7)
          return `${diffDays}天前`;
        if (diffDays < 30)
          return `${Math.floor(diffDays / 7)}周前`;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        if (year === now.getFullYear()) {
          return `${month}-${day}`;
        }
        return `${year}-${month}-${day}`;
      },
      onImageLoad(e) {
        formatAppLog("log", "at pages/index/index.vue:287", "图片加载成功");
      },
      onImageError(e) {
        formatAppLog("error", "at pages/index/index.vue:291", "图片加载失败:", e);
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_refresher = vue.resolveComponent("uni-refresher");
    const _component_uni_icons = vue.resolveComponent("uni-icons");
    const _component_uni_load_more = vue.resolveComponent("uni-load-more");
    return vue.openBlock(), vue.createElementBlock("view", { class: "album-container" }, [
      vue.createVNode(_component_uni_refresher, {
        enable: true,
        onRefresh: $options.onRefresh
      }, null, 8, ["onRefresh"]),
      $data.albumList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "album-grid"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.albumList, (album, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "album-card",
              key: index,
              onClick: ($event) => $options.goToAlbum(album.id)
            }, [
              vue.createElementVNode("view", { class: "album-cover-container" }, [
                album.cover_photo && album.cover_photo.image_url ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 0,
                  class: "album-cover-image",
                  src: album.cover_photo.image_url,
                  mode: "aspectFill",
                  onLoad: _cache[0] || (_cache[0] = (...args) => $options.onImageLoad && $options.onImageLoad(...args)),
                  onError: _cache[1] || (_cache[1] = (...args) => $options.onImageError && $options.onImageError(...args))
                }, null, 40, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "album-cover-placeholder"
                }, [
                  vue.createVNode(_component_uni_icons, {
                    type: "image",
                    size: "60",
                    color: "#ccc"
                  }),
                  vue.createElementVNode("text", { class: "placeholder-text" }, "暂无封面")
                ])),
                album.photo_count > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 2,
                  class: "photo-count-badge"
                }, [
                  vue.createVNode(_component_uni_icons, {
                    type: "camera-filled",
                    size: "24",
                    color: "#fff"
                  }),
                  vue.createElementVNode(
                    "text",
                    { class: "count-text" },
                    vue.toDisplayString(album.photo_count),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["privacy-badge", { "public": album.is_public, "private": !album.is_public }])
                  },
                  vue.toDisplayString(album.is_public ? "公开" : "私密"),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              vue.createElementVNode("view", { class: "album-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "album-name" },
                  vue.toDisplayString(album.name),
                  1
                  /* TEXT */
                ),
                album.detail ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "album-detail"
                  },
                  vue.toDisplayString(album.detail),
                  1
                  /* TEXT */
                )) : (vue.openBlock(), vue.createElementBlock("text", {
                  key: 1,
                  class: "no-detail"
                }, "暂无描述")),
                vue.createElementVNode("view", { class: "album-meta" }, [
                  vue.createElementVNode("view", { class: "meta-item" }, [
                    vue.createVNode(_component_uni_icons, {
                      type: "calendar",
                      size: "24",
                      color: "#999"
                    }),
                    vue.createElementVNode(
                      "text",
                      { class: "meta-text" },
                      vue.toDisplayString($options.formatDate(album.created_at)),
                      1
                      /* TEXT */
                    )
                  ]),
                  album.user && album.user.username ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "meta-item"
                  }, [
                    vue.createVNode(_component_uni_icons, {
                      type: "person",
                      size: "24",
                      color: "#999"
                    }),
                    vue.createElementVNode(
                      "text",
                      { class: "meta-text" },
                      vue.toDisplayString(album.user.username),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true)
                ])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode("image", {
          class: "empty-image",
          src: _imports_0$1,
          mode: "widthFix"
        }),
        vue.createElementVNode("text", { class: "empty-title" }, "还没有相册"),
        vue.createElementVNode("text", { class: "empty-subtitle" }, "点击下方按钮创建一个吧"),
        vue.createElementVNode("button", {
          class: "create-button",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.createAlbum && $options.createAlbum(...args))
        }, "创建相册")
      ])) : vue.createCommentVNode("v-if", true),
      $data.loading && $data.albumList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "loading-state"
      }, [
        vue.createVNode(_component_uni_load_more, {
          status: "loading",
          "content-text": { contentdown: "上拉显示更多", contentrefresh: "正在加载...", contentnomore: "没有更多了" }
        }, null, 8, ["content-text"])
      ])) : vue.createCommentVNode("v-if", true),
      $data.albumList.length > 0 && $data.hasMore ? (vue.openBlock(), vue.createElementBlock("view", { key: 3 }, [
        vue.createVNode(_component_uni_load_more, {
          status: $data.loadMoreStatus,
          onClickLoadMore: $options.loadMore
        }, null, 8, ["status", "onClickLoadMore"])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "fab-container" }, [
        vue.createElementVNode("button", {
          class: "fab-button",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.createAlbum && $options.createAlbum(...args))
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "plusempty",
            size: "30",
            color: "#fff"
          }),
          vue.createElementVNode("text", null, "新建相册")
        ])
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-1cf27b2a"], ["__file", "E:/code/geng_xin/front/pages/index/index.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {};
    },
    methods: {}
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, " album ");
  }
  const PagesAlbumAlbum = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "E:/code/geng_xin/front/pages/album/album.vue"]]);
  const _imports_0 = "/static/empty-photo.png";
  const _sfc_main$3 = {
    data() {
      return {
        userId: null,
        profile: {
          id: 0,
          username: "",
          gender: "O",
          signature: "",
          avatar: "",
          created_at: ""
        },
        albumCount: 0,
        photoCount: 0,
        followerCount: 0,
        followingCount: 0,
        recentPhotos: [],
        loading: false,
        uploadingAvatar: false
      };
    },
    onLoad(options) {
      if (options.userId) {
        this.userId = options.userId;
      } else {
        this.userId = 1;
      }
      this.loadProfile();
      this.loadStats();
      this.loadRecentPhotos();
    },
    onShow() {
      this.loadProfile();
    },
    onPullDownRefresh() {
      this.refreshData();
    },
    methods: {
      async loadProfile() {
        this.loading = true;
        try {
          const token = uni.getStorageSync("token");
          if (!token) {
            uni.navigateTo({
              url: "/pages/login/login"
            });
            return;
          }
          const result = await request({
            url: `${cfg.base_url}/profiles/${this.userId}/`,
            method: "GET",
            header: {
              "Authorization": `Token ${token}`,
              "Content-Type": "application/json"
            }
          });
          formatAppLog("log", "at pages/self/self.vue:264", "获取用户信息成功:", result);
          this.profile = result;
        } catch (error) {
          formatAppLog("error", "at pages/self/self.vue:268", "获取用户信息失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "error"
          });
        } finally {
          this.loading = false;
        }
      },
      async loadStats() {
        try {
          const token = uni.getStorageSync("token");
          this.albumCount = 4;
          this.photoCount = 16;
          this.followerCount = 520;
          this.followingCount = 1314;
        } catch (error) {
          formatAppLog("error", "at pages/self/self.vue:290", "获取统计数据失败:", error);
        }
      },
      async loadRecentPhotos() {
        try {
          const token = uni.getStorageSync("token");
          this.recentPhotos = [
            { id: 1, image_url: "https://picsum.photos/300/300?random=1" },
            { id: 2, image_url: "https://picsum.photos/300/300?random=2" },
            { id: 3, image_url: "https://picsum.photos/300/300?random=3" },
            { id: 4, image_url: "https://picsum.photos/300/300?random=4" }
          ];
        } catch (error) {
          formatAppLog("error", "at pages/self/self.vue:308", "获取最近照片失败:", error);
        }
      },
      async refreshData() {
        await Promise.all([
          this.loadProfile(),
          this.loadStats(),
          this.loadRecentPhotos()
        ]);
        uni.showToast({
          title: "刷新成功",
          icon: "success"
        });
        uni.stopPullDownRefresh();
      },
      goBack() {
        uni.navigateBack({
          delta: 1,
          animationType: "slide-out-left"
        });
      },
      editProfile() {
        uni.showActionSheet({
          itemList: ["修改个人信息", "修改密码", "账号设置"],
          success: (res) => {
            if (res.tapIndex === 0) {
              this.editBasicInfo();
            } else if (res.tapIndex === 1) {
              this.changePassword();
            }
          }
        });
      },
      editBasicInfo() {
        uni.showModal({
          title: "修改个人信息",
          content: "请填写个人信息",
          editable: true,
          placeholderText: this.profile.username,
          success: async (res) => {
            if (res.confirm && res.content.trim()) {
              try {
                const token = uni.getStorageSync("token");
                await request({
                  url: `${cfg.base_url}/profiles/${this.userId}/`,
                  method: "PUT",
                  header: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                  },
                  data: {
                    username: res.content.trim(),
                    gender: this.profile.gender,
                    signature: this.profile.signature
                  }
                });
                uni.showToast({
                  title: "修改成功",
                  icon: "success"
                });
                this.loadProfile();
              } catch (error) {
                formatAppLog("error", "at pages/self/self.vue:377", "修改失败:", error);
                uni.showToast({
                  title: "修改失败",
                  icon: "error"
                });
              }
            }
          }
        });
      },
      changeAvatar() {
        uni.showActionSheet({
          itemList: ["拍照", "从相册选择"],
          success: (res) => {
            const sourceType = res.tapIndex === 0 ? ["camera"] : ["album"];
            uni.chooseImage({
              count: 1,
              sizeType: ["compressed"],
              sourceType,
              success: async (chooseRes) => {
                const tempFilePath = chooseRes.tempFilePaths[0];
                this.uploadAvatar(tempFilePath);
              }
            });
          }
        });
      },
      async uploadAvatar(filePath) {
        this.uploadingAvatar = true;
        try {
          const token = uni.getStorageSync("token");
          uni.uploadFile({
            url: `${cfg.base_url}/profiles/${this.userId}/upload_avatar/`,
            // 需要根据实际API调整
            filePath,
            name: "avatar",
            formData: {
              "user_id": this.userId
            },
            header: {
              "Authorization": `Token ${token}`
            },
            success: (uploadRes) => {
              const data = JSON.parse(uploadRes.data);
              formatAppLog("log", "at pages/self/self.vue:425", "上传成功:", data);
              if (data.avatar) {
                this.profile.avatar = data.avatar;
                uni.showToast({
                  title: "头像更新成功",
                  icon: "success"
                });
              }
            },
            fail: (error) => {
              formatAppLog("error", "at pages/self/self.vue:436", "上传失败:", error);
              uni.showToast({
                title: "上传失败",
                icon: "error"
              });
            },
            complete: () => {
              this.uploadingAvatar = false;
            }
          });
        } catch (error) {
          formatAppLog("error", "at pages/self/self.vue:448", "上传头像失败:", error);
          this.uploadingAvatar = false;
        }
      },
      editSignature() {
        uni.showModal({
          title: "修改个性签名",
          content: "请输入个性签名",
          editable: true,
          placeholderText: this.profile.signature || "一句话介绍你自己",
          maxlength: 50,
          success: async (res) => {
            if (res.confirm) {
              const newSignature = res.content.trim();
              try {
                const token = uni.getStorageSync("token");
                await request({
                  url: `${cfg.base_url}/profiles/${this.userId}/`,
                  method: "PATCH",
                  header: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                  },
                  data: {
                    signature: newSignature
                  }
                });
                this.profile.signature = newSignature;
                uni.showToast({
                  title: "签名已更新",
                  icon: "success"
                });
              } catch (error) {
                formatAppLog("error", "at pages/self/self.vue:485", "更新签名失败:", error);
                uni.showToast({
                  title: "更新失败",
                  icon: "error"
                });
              }
            }
          }
        });
      },
      getGenderClass(gender) {
        switch (gender) {
          case "M":
            return "gender-male";
          case "F":
            return "gender-female";
          default:
            return "gender-other";
        }
      },
      getGenderIcon(gender) {
        switch (gender) {
          case "M":
            return "male";
          case "F":
            return "female";
          default:
            return "person";
        }
      },
      getGenderText(gender) {
        switch (gender) {
          case "M":
            return "男";
          case "F":
            return "女";
          default:
            return "保密";
        }
      },
      formatRegisterTime(dateString) {
        if (!dateString)
          return "";
        const date = new Date(dateString);
        const now = /* @__PURE__ */ new Date();
        const diffDays = Math.floor((now - date) / (1e3 * 60 * 60 * 24));
        if (diffDays === 0)
          return "今天";
        if (diffDays === 1)
          return "昨天";
        if (diffDays < 30)
          return `${diffDays}天前`;
        if (diffDays < 365)
          return `${Math.floor(diffDays / 30)}个月前`;
        return `${Math.floor(diffDays / 365)}年前`;
      },
      goToAlbumList() {
        uni.navigateTo({
          url: "/pages/album/index",
          animationType: "slide-in-right"
        });
      },
      goToPhotoList() {
        uni.navigateTo({
          url: "/pages/photo/my-photos",
          animationType: "slide-in-right"
        });
      },
      goToFollowers() {
        uni.navigateTo({
          url: "/pages/profile/followers",
          animationType: "slide-in-right"
        });
      },
      goToFollowing() {
        uni.navigateTo({
          url: "/pages/profile/following",
          animationType: "slide-in-right"
        });
      },
      goToFavorites() {
        uni.navigateTo({
          url: "/pages/photo/favorites",
          animationType: "slide-in-right"
        });
      },
      goToPrivacySettings() {
        uni.navigateTo({
          url: "/pages/settings/privacy",
          animationType: "slide-in-right"
        });
      },
      goToAbout() {
        uni.navigateTo({
          url: "/pages/settings/about",
          animationType: "slide-in-right"
        });
      },
      previewPhoto(index) {
        const urls = this.recentPhotos.map((photo) => photo.image_url);
        uni.previewImage({
          current: index,
          urls
        });
      },
      logout() {
        uni.showModal({
          title: "退出登录",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              uni.removeStorageSync("token");
              uni.removeStorageSync("userInfo");
              uni.showToast({
                title: "已退出登录",
                icon: "success"
              });
              setTimeout(() => {
                uni.reLaunch({
                  url: "/pages/login/login"
                });
              }, 1500);
            }
          }
        });
      },
      changePassword() {
        uni.navigateTo({
          url: "/pages/settings/change-password",
          animationType: "slide-in-right"
        });
      },
      onAvatarError(e) {
        formatAppLog("error", "at pages/self/self.vue:625", "头像加载失败:", e);
        this.profile.avatar = "/static/default-avatar.png";
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = vue.resolveComponent("uni-icons");
    const _component_uni_load_more = vue.resolveComponent("uni-load-more");
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-container" }, [
      vue.createElementVNode("view", {
        class: "nav-back",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
      }, [
        vue.createVNode(_component_uni_icons, {
          type: "arrowleft",
          size: "32",
          color: "#333"
        })
      ]),
      vue.createElementVNode("view", {
        class: "edit-profile",
        onClick: _cache[1] || (_cache[1] = (...args) => $options.editProfile && $options.editProfile(...args))
      }, [
        vue.createVNode(_component_uni_icons, {
          type: "compose",
          size: "32",
          color: "#333"
        })
      ]),
      vue.createElementVNode("view", { class: "profile-card" }, [
        vue.createElementVNode("view", { class: "avatar-section" }, [
          vue.createElementVNode("image", {
            class: "avatar-image",
            src: $data.profile.avatar,
            mode: "aspectFill",
            onError: _cache[2] || (_cache[2] = (...args) => $options.onAvatarError && $options.onAvatarError(...args))
          }, [
            $data.uploadingAvatar ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "avatar-loading"
            }, [
              vue.createVNode(_component_uni_icons, {
                type: "spinner-cycle",
                size: "40",
                color: "#fff"
              })
            ])) : vue.createCommentVNode("v-if", true)
          ], 40, ["src"]),
          vue.createElementVNode("view", {
            class: "change-avatar-btn",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.changeAvatar && $options.changeAvatar(...args))
          }, [
            vue.createVNode(_component_uni_icons, {
              type: "camera-filled",
              size: "28",
              color: "#fff"
            })
          ]),
          vue.createElementVNode("view", { class: "online-status" })
        ]),
        vue.createElementVNode("view", { class: "profile-info" }, [
          vue.createElementVNode("view", { class: "username-row" }, [
            vue.createElementVNode(
              "text",
              { class: "username" },
              vue.toDisplayString($data.profile.username),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["gender-badge", $options.getGenderClass($data.profile.gender)])
              },
              [
                vue.createVNode(_component_uni_icons, {
                  type: $options.getGenderIcon($data.profile.gender),
                  size: "24",
                  color: "#fff"
                }, null, 8, ["type"]),
                vue.createElementVNode(
                  "text",
                  { class: "gender-text" },
                  vue.toDisplayString($options.getGenderText($data.profile.gender)),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            )
          ]),
          vue.createElementVNode(
            "text",
            { class: "user-id" },
            "ID: " + vue.toDisplayString($data.profile.id),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", {
            class: "signature-section",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.editSignature && $options.editSignature(...args))
          }, [
            vue.createElementVNode("view", { class: "signature-header" }, [
              vue.createVNode(_component_uni_icons, {
                type: "quote",
                size: "28",
                color: "#667eea"
              }),
              vue.createElementVNode("text", { class: "signature-title" }, "个性签名")
            ]),
            $data.profile.signature ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "signature-content"
              },
              vue.toDisplayString($data.profile.signature),
              1
              /* TEXT */
            )) : (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "no-signature"
            }, " 点击设置个性签名 "))
          ])
        ]),
        vue.createElementVNode("view", { class: "register-time" }, [
          vue.createVNode(_component_uni_icons, {
            type: "calendar",
            size: "28",
            color: "#999"
          }),
          vue.createElementVNode(
            "text",
            { class: "register-text" },
            "注册于 " + vue.toDisplayString($options.formatRegisterTime($data.profile.created_at)),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "stats-card" }, [
        vue.createElementVNode("view", { class: "stats-row" }, [
          vue.createElementVNode("view", {
            class: "stat-item",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.goToAlbumList && $options.goToAlbumList(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "stat-number" },
              vue.toDisplayString($data.albumCount),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "stat-label" }, "相册")
          ]),
          vue.createElementVNode("view", { class: "stat-divider" }),
          vue.createElementVNode("view", {
            class: "stat-item",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.goToPhotoList && $options.goToPhotoList(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "stat-number" },
              vue.toDisplayString($data.photoCount),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "stat-label" }, "照片")
          ]),
          vue.createElementVNode("view", { class: "stat-divider" }),
          vue.createElementVNode("view", {
            class: "stat-item",
            onClick: _cache[7] || (_cache[7] = (...args) => $options.goToFollowers && $options.goToFollowers(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "stat-number" },
              vue.toDisplayString($data.followerCount),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "stat-label" }, "粉丝")
          ]),
          vue.createElementVNode("view", { class: "stat-divider" }),
          vue.createElementVNode("view", {
            class: "stat-item",
            onClick: _cache[8] || (_cache[8] = (...args) => $options.goToFollowing && $options.goToFollowing(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "stat-number" },
              vue.toDisplayString($data.followingCount),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "stat-label" }, "关注")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "modules-section" }, [
        vue.createElementVNode("view", {
          class: "module-card",
          onClick: _cache[9] || (_cache[9] = (...args) => $options.goToAlbumList && $options.goToAlbumList(...args))
        }, [
          vue.createElementVNode("view", { class: "module-header" }, [
            vue.createElementVNode("view", { class: "module-icon" }, [
              vue.createVNode(_component_uni_icons, {
                type: "album",
                size: "36",
                color: "#667eea"
              })
            ]),
            vue.createElementVNode("text", { class: "module-title" }, "我的相册")
          ]),
          vue.createVNode(_component_uni_icons, {
            type: "arrowright",
            size: "28",
            color: "#999"
          })
        ]),
        vue.createElementVNode("view", {
          class: "module-card",
          onClick: _cache[10] || (_cache[10] = (...args) => $options.goToFavorites && $options.goToFavorites(...args))
        }, [
          vue.createElementVNode("view", { class: "module-header" }, [
            vue.createElementVNode("view", { class: "module-icon" }, [
              vue.createVNode(_component_uni_icons, {
                type: "star",
                size: "36",
                color: "#ffb300"
              })
            ]),
            vue.createElementVNode("text", { class: "module-title" }, "我的收藏")
          ]),
          vue.createVNode(_component_uni_icons, {
            type: "arrowright",
            size: "28",
            color: "#999"
          })
        ]),
        vue.createElementVNode("view", {
          class: "module-card",
          onClick: _cache[11] || (_cache[11] = (...args) => $options.goToPrivacySettings && $options.goToPrivacySettings(...args))
        }, [
          vue.createElementVNode("view", { class: "module-header" }, [
            vue.createElementVNode("view", { class: "module-icon" }, [
              vue.createVNode(_component_uni_icons, {
                type: "locked",
                size: "36",
                color: "#f44336"
              })
            ]),
            vue.createElementVNode("text", { class: "module-title" }, "隐私设置")
          ]),
          vue.createVNode(_component_uni_icons, {
            type: "arrowright",
            size: "28",
            color: "#999"
          })
        ]),
        vue.createElementVNode("view", {
          class: "module-card",
          onClick: _cache[12] || (_cache[12] = (...args) => $options.goToAbout && $options.goToAbout(...args))
        }, [
          vue.createElementVNode("view", { class: "module-header" }, [
            vue.createElementVNode("view", { class: "module-icon" }, [
              vue.createVNode(_component_uni_icons, {
                type: "info",
                size: "36",
                color: "#4caf50"
              })
            ]),
            vue.createElementVNode("text", { class: "module-title" }, "关于我们")
          ]),
          vue.createVNode(_component_uni_icons, {
            type: "arrowright",
            size: "28",
            color: "#999"
          })
        ])
      ]),
      vue.createElementVNode("view", { class: "recent-photos-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "最近上传"),
          vue.createElementVNode("text", {
            class: "see-all",
            onClick: _cache[13] || (_cache[13] = (...args) => $options.goToPhotoList && $options.goToPhotoList(...args))
          }, "查看全部")
        ]),
        $data.recentPhotos.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "recent-photos-grid"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.recentPhotos, (photo, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "photo-item",
                key: index,
                onClick: ($event) => $options.previewPhoto(index)
              }, [
                vue.createElementVNode("image", {
                  class: "photo-image",
                  src: photo.image_url,
                  mode: "aspectFill"
                }, null, 8, ["src"])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "no-recent-photos"
        }, [
          vue.createElementVNode("image", {
            class: "empty-image",
            src: _imports_0,
            mode: "widthFix"
          }),
          vue.createElementVNode("text", { class: "empty-text" }, "还没有上传照片"),
          vue.createElementVNode("button", {
            class: "upload-btn",
            onClick: _cache[14] || (_cache[14] = (...args) => $options.goToAlbumList && $options.goToAlbumList(...args))
          }, " 去上传 ")
        ]))
      ]),
      vue.createElementVNode("view", { class: "logout-section" }, [
        vue.createElementVNode("button", {
          class: "logout-btn",
          onClick: _cache[15] || (_cache[15] = (...args) => $options.logout && $options.logout(...args))
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "undo",
            size: "28",
            color: "#fff"
          }),
          vue.createElementVNode("text", null, "退出登录")
        ])
      ]),
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-overlay"
      }, [
        vue.createVNode(_component_uni_load_more, {
          status: "loading",
          "icon-size": 48
        })
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesSelfSelf = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-f94a969d"], ["__file", "E:/code/geng_xin/front/pages/self/self.vue"]]);
  const _sfc_main$2 = {
    data() {
      formatAppLog("log", "at pages/login/login.vue:132", cfg.base_url);
      const isUni = typeof uni !== "undefined";
      return {
        username: "",
        userpwd: "",
        pwdType: "password",
        rememberMe: false,
        loading: false,
        loadingBg: false,
        // 背景图加载状态
        bgLoadFailed: false,
        // 背景图加载失败
        networkBgImage: "http://127.0.0.1:8000/media/loginBackgroundImg/2026/01/06/bk.jpeg",
        // 网络背景图URL
        networkBgImages: [],
        // 所有网络背景图数组
        currentBgIndex: 0,
        // 当前背景图索引
        defaultBgImages: [
          isUni ? "/static/bg1.jpg" : require("./images/bg1.jpg"),
          isUni ? "/static/bg2.jpg" : require("./images/bg2.jpg"),
          isUni ? "/static/bg3.jpg" : require("./images/bg3.jpg"),
          isUni ? "/static/bg4.jpg" : require("./images/bg4.jpg")
        ],
        imgInfo: {
          icon_user: isUni ? "/static/icon_user.png" : require("./images/icon_user.png"),
          icon_del: isUni ? "/static/icon_del.png" : require("./images/icon_del.png"),
          icon_pwd: isUni ? "/static/icon_pwd.png" : require("./images/icon_pwd.png"),
          icon_pwd_switch: isUni ? "/static/icon_pwd_switch.png" : require("./images/icon_pwd_switch.png"),
          refresh: isUni ? "/static/refresh.png" : require("./images/refresh.png")
        }
      };
    },
    computed: {
      canSubmit() {
        return this.username.length > 0 && this.userpwd.length >= 6 && !this.loading;
      }
    },
    onLoad() {
      this.loadRememberedData();
      this.fetchBackgroundImage();
    },
    methods: {
      // 获取网络背景图片
      async fetchBackgroundImage() {
        if (this.loadingBg)
          return;
        this.loadingBg = true;
        this.bgLoadFailed = false;
        try {
          const response = await request({
            url: `${cfg.base_url}/api/loginImg/`,
            // 您的背景图API
            method: "GET",
            timeout: 8e3
            // 增加超时时间
          });
          formatAppLog("log", "at pages/login/login.vue:185", "背景图API响应:", response);
          if (response && response.results && response.results.length > 0) {
            const images = response.results.map((item) => {
              if (item.image && item.image.startsWith("http")) {
                return item.image;
              } else if (item.image) {
                return `${cfg.base_url}${item.image.startsWith("/") ? "" : "/"}${item.image}`;
              }
              return null;
            }).filter((url) => url !== null);
            if (images.length > 0) {
              this.networkBgImages = images;
              this.networkBgImage = images[0];
              formatAppLog("log", "at pages/login/login.vue:203", "设置背景图URL:", this.networkBgImage);
            } else {
              throw new Error("未获取到有效的图片URL");
            }
          } else {
            throw new Error("API返回数据格式错误或为空");
          }
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:213", "加载网络背景图失败:", error);
          this.bgLoadFailed = true;
          this.networkBgImage = "";
          this.networkBgImages = [];
          uni.showToast({
            title: "使用默认背景",
            icon: "none",
            duration: 1500
          });
        } finally {
          setTimeout(() => {
            this.loadingBg = false;
          }, 500);
        }
      },
      // 网络背景图加载成功
      onNetworkBgLoad() {
        formatAppLog("log", "at pages/login/login.vue:234", "网络背景图加载成功");
        this.bgLoadFailed = false;
      },
      // 网络背景图加载失败
      onNetworkBgError() {
        formatAppLog("error", "at pages/login/login.vue:240", "网络背景图加载失败");
        this.bgLoadFailed = true;
        this.networkBgImage = "";
      },
      // 刷新背景图
      async refreshBackground() {
        if (this.loadingBg)
          return;
        if (this.networkBgImages.length > 1) {
          this.currentBgIndex = (this.currentBgIndex + 1) % this.networkBgImages.length;
          this.networkBgImage = this.networkBgImages[this.currentBgIndex];
          uni.showToast({
            title: "切换背景",
            icon: "none",
            duration: 1e3
          });
        } else {
          this.networkBgImage = "";
          this.fetchBackgroundImage();
          uni.showToast({
            title: "获取新背景中...",
            icon: "none",
            duration: 1e3
          });
        }
      },
      getHeartStyle(index) {
        const left = Math.random() * 100;
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 5;
        const size = 20 + Math.random() * 20;
        const opacity = 0.2 + Math.random() * 0.3;
        const rotate = Math.random() * 360;
        return {
          left: `${left}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          fontSize: `${size}rpx`,
          opacity,
          transform: `rotate(${rotate}deg)`
        };
      },
      inputUsername(e) {
        this.username = e.detail.value;
      },
      inputPwd(e) {
        this.userpwd = e.detail.value;
      },
      delUser() {
        this.username = "";
      },
      switchPwd() {
        this.pwdType = this.pwdType === "text" ? "password" : "text";
      },
      toggleRemember() {
        this.rememberMe = !this.rememberMe;
      },
      loadRememberedData() {
        try {
          const remembered = uni.getStorageSync("rememberedLogin");
          if (remembered) {
            this.username = remembered.username || "";
            this.userpwd = remembered.password || "";
            this.rememberMe = true;
          }
        } catch (e) {
          formatAppLog("error", "at pages/login/login.vue:318", "读取存储失败:", e);
        }
      },
      async login() {
        if (!this.canSubmit)
          return;
        this.loading = true;
        uni.showLoading({
          title: "登录中..."
        });
        try {
          const result = await request({
            url: `${cfg.base_url}/login/in/`,
            method: "POST",
            data: {
              username: this.username,
              password: this.userpwd
            },
            timeout: 2e3
          });
          if (result.code === 200) {
            uni.showToast({
              title: "登录成功",
              icon: "success",
              duration: 1500
            });
            if (this.rememberMe) {
              uni.setStorageSync("rememberedLogin", {
                username: this.username,
                password: this.userpwd
              });
            } else {
              uni.removeStorageSync("rememberedLogin");
            }
            if (result.token) {
              uni.setStorageSync("token", result.token);
            }
            if (result.username) {
              uni.setStorageSync("username", result.username);
            }
            if (result.id) {
              uni.setStorageSync("id", result.id);
            }
            setTimeout(() => {
              uni.switchTab({
                url: "/pages/index/index",
                success() {
                  formatAppLog("log", "at pages/login/login.vue:375", "跳转成功");
                },
                fail(err) {
                  formatAppLog("log", "at pages/login/login.vue:378", "跳转失败:", err);
                }
              });
            }, 1500);
          } else {
            uni.showToast({
              title: "用户名或密码错误",
              icon: "error",
              duration: 1500
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:390", "网络异常:", error);
          uni.showToast({
            title: "网络异常，请重试",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      goReg() {
        uni.navigateTo({
          url: "/pages/reg/reg"
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page_login" }, [
      vue.createElementVNode("view", { class: "slider-background" }, [
        $data.networkBgImage && !$data.bgLoadFailed ? (vue.openBlock(), vue.createElementBlock("image", {
          key: 0,
          class: "network-background-image",
          src: $data.networkBgImage,
          mode: "aspectFill",
          onError: _cache[0] || (_cache[0] = (...args) => $options.onNetworkBgError && $options.onNetworkBgError(...args)),
          onLoad: _cache[1] || (_cache[1] = (...args) => $options.onNetworkBgLoad && $options.onNetworkBgLoad(...args))
        }, null, 40, ["src"])) : vue.createCommentVNode("v-if", true),
        $data.networkBgImage && !$data.bgLoadFailed ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "network-bg-overlay"
        })) : vue.createCommentVNode("v-if", true),
        (!$data.networkBgImage || $data.bgLoadFailed) && !$data.loadingBg ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "default-background"
        }, [
          vue.createElementVNode("swiper", {
            class: "background-swiper",
            autoplay: true,
            interval: 5e3,
            duration: 1e3,
            circular: ""
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.defaultBgImages, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("swiper-item", { key: index }, [
                  vue.createElementVNode("image", {
                    class: "bg-image",
                    src: item,
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", { class: "bg-overlay" })
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "falling-hearts" }, [
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList(15, (i) => {
              return vue.createElementVNode(
                "text",
                {
                  key: i,
                  class: "heart",
                  style: vue.normalizeStyle($options.getHeartStyle(i))
                },
                "❤️",
                4
                /* STYLE */
              );
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        $data.loadingBg ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "bg-loading-mask"
        }, [
          vue.createElementVNode("view", { class: "loading-content" }, [
            vue.createElementVNode("view", { class: "loading-dots" }, [
              vue.createElementVNode("view", { class: "dot" }),
              vue.createElementVNode("view", { class: "dot" }),
              vue.createElementVNode("view", { class: "dot" })
            ]),
            vue.createElementVNode("text", { class: "loading-text" }, "加载背景中...")
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "login-card" }, [
        vue.createElementVNode("view", { class: "head" }, [
          vue.createElementVNode("view", { class: "logo-container" }, [
            vue.createElementVNode("view", { class: "logo-circle" }, [
              vue.createElementVNode("view", { class: "logo-inner" }, [
                vue.createElementVNode("view", { class: "gx-heart" }, [
                  vue.createElementVNode("text", { class: "g-letter" }, "g"),
                  vue.createElementVNode("view", { class: "heart-dot" }, "❤"),
                  vue.createElementVNode("text", { class: "x-letter" }, "x")
                ])
              ])
            ]),
            vue.createElementVNode("text", { class: "app-name" }, "甜蜜记忆"),
            vue.createElementVNode("text", { class: "app-slogan" }, "记录每一刻的甜蜜")
          ])
        ]),
        vue.createElementVNode("view", { class: "login_form" }, [
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("view", { class: "input-box" }, [
              vue.createElementVNode("view", { class: "icon-wrapper" }, [
                vue.createElementVNode("image", {
                  class: "input-icon",
                  src: $data.imgInfo.icon_user,
                  mode: "widthFix"
                }, null, 8, ["src"])
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "text",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.username = $event),
                  placeholder: "请输入用户账号",
                  "placeholder-class": "placeholder",
                  onInput: _cache[3] || (_cache[3] = (...args) => $options.inputUsername && $options.inputUsername(...args))
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [vue.vModelText, $data.username]
              ]),
              vue.createElementVNode("view", {
                class: "icon-wrapper",
                onClick: _cache[4] || (_cache[4] = (...args) => $options.delUser && $options.delUser(...args))
              }, [
                $data.username ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 0,
                  class: "clear-icon",
                  src: $data.imgInfo.icon_del,
                  mode: "widthFix"
                }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("view", { class: "input-box" }, [
              vue.createElementVNode("view", { class: "icon-wrapper" }, [
                vue.createElementVNode("image", {
                  class: "input-icon",
                  src: $data.imgInfo.icon_pwd,
                  mode: "widthFix"
                }, null, 8, ["src"])
              ]),
              vue.createElementVNode("input", {
                type: $data.pwdType,
                value: $data.userpwd,
                onInput: _cache[5] || (_cache[5] = (...args) => $options.inputPwd && $options.inputPwd(...args)),
                placeholder: "请输入密码",
                "placeholder-class": "placeholder"
              }, null, 40, ["type", "value"]),
              vue.createElementVNode("view", {
                class: "icon-wrapper",
                onClick: _cache[6] || (_cache[6] = (...args) => $options.switchPwd && $options.switchPwd(...args))
              }, [
                vue.createElementVNode("image", {
                  class: "pwd-toggle-icon",
                  src: $data.imgInfo.icon_pwd_switch,
                  mode: "widthFix"
                }, null, 8, ["src"])
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "login-options" }, [
            vue.createElementVNode("view", {
              class: "remember-me",
              onClick: _cache[7] || (_cache[7] = (...args) => $options.toggleRemember && $options.toggleRemember(...args))
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["checkbox", { "checked": $data.rememberMe }])
                },
                [
                  $data.rememberMe ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode("text", { class: "option-text" }, "记住密码")
            ])
          ]),
          vue.createElementVNode("button", {
            class: vue.normalizeClass(["login-btn", { "disabled": !$options.canSubmit }]),
            disabled: !$options.canSubmit,
            onClick: _cache[8] || (_cache[8] = (...args) => $options.login && $options.login(...args))
          }, [
            !$data.loading ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "登录")) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "loading"
            }, [
              vue.createElementVNode("view", { class: "loading-spinner" }),
              vue.createElementVNode("text", null, "登录中...")
            ]))
          ], 10, ["disabled"]),
          vue.createElementVNode("view", { class: "register-guide" }, [
            vue.createElementVNode("text", { class: "guide-text" }, "还没有账号？"),
            vue.createElementVNode("text", {
              class: "register-link",
              onClick: _cache[9] || (_cache[9] = (...args) => $options.goReg && $options.goReg(...args))
            }, "立即注册")
          ]),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["bg-switch", { "disabled": $data.loadingBg }]),
              onClick: _cache[10] || (_cache[10] = (...args) => $options.refreshBackground && $options.refreshBackground(...args))
            },
            [
              vue.createElementVNode("image", {
                class: "refresh-icon",
                src: $data.imgInfo.refresh,
                mode: "widthFix"
              }, null, 8, ["src"]),
              vue.createElementVNode(
                "text",
                { class: "refresh-text" },
                vue.toDisplayString($data.loadingBg ? "加载中..." : "换张背景"),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ])
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-e4e4508d"], ["__file", "E:/code/geng_xin/front/pages/login/login.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        albumId: null,
        album: {},
        photoList: [],
        loading: false,
        photoLoading: false,
        photoPage: 1,
        photoPageSize: 12,
        photoHasMore: true,
        photoLoadMoreStatus: "more",
        selectionMode: false,
        selectedPhotos: []
      };
    },
    onLoad(options) {
      if (options.id) {
        this.albumId = options.id;
        this.loadAlbumDetail();
        this.loadPhotos();
      } else {
        uni.showToast({
          title: "参数错误",
          icon: "error"
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    onPullDownRefresh() {
      this.refreshData();
    },
    onReachBottom() {
      if (this.photoHasMore && !this.photoLoading) {
        this.loadMorePhotos();
      }
    },
    methods: {
      async loadAlbumDetail() {
        this.loading = true;
        try {
          const token = uni.getStorageSync("token");
          const result = await request({
            url: `${cfg.base_url}/album/${this.albumId}/`,
            method: "GET",
            header: {
              "token": `${token}`,
              "Content-Type": "application/json"
            }
          });
          this.album = result;
          formatAppLog("log", "at pages/detailPic/detailPic.vue:242", "this.album:", this.album);
        } catch (error) {
          formatAppLog("error", "at pages/detailPic/detailPic.vue:244", "加载相册详情失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "error"
          });
        } finally {
          this.loading = false;
        }
      },
      async loadPhotos(isRefresh = false) {
        if (this.photoLoading)
          return;
        this.photoLoading = true;
        if (isRefresh) {
          this.photoPage = 1;
          this.photoHasMore = true;
        }
        try {
          const token = uni.getStorageSync("token");
          const params = {
            page: this.photoPage,
            page_size: this.photoPageSize
            // album_id: this.albumId
          };
          const result = await request({
            url: `${cfg.base_url}/album/${this.albumId}/`,
            method: "GET",
            header: {
              "token": `${token}`,
              "Content-Type": "application/json"
            }
            // data: params
          });
          if (isRefresh) {
            this.photoList = result.photos || result;
          } else {
            this.photoList = [...this.photoList, ...result.photos || result];
          }
          formatAppLog("log", "at pages/detailPic/detailPic.vue:285", "ytwytw", this.photoList);
          this.photoHasMore = result.next !== null && result.next !== void 0;
        } catch (error) {
          formatAppLog("error", "at pages/detailPic/detailPic.vue:290", "加载照片失败:", error);
        } finally {
          this.photoLoading = false;
          uni.stopPullDownRefresh();
        }
      },
      async refreshData() {
        await Promise.all([
          this.loadAlbumDetail(),
          this.loadPhotos(true)
        ]);
        uni.showToast({
          title: "刷新成功",
          icon: "success"
        });
      },
      async loadMorePhotos() {
        if (!this.photoHasMore || this.photoLoading)
          return;
        this.photoLoadMoreStatus = "loading";
        this.photoPage++;
        try {
          await this.loadPhotos();
        } finally {
          this.photoLoadMoreStatus = this.photoHasMore ? "more" : "noMore";
        }
      },
      previewPhoto(index) {
        if (this.selectionMode) {
          this.togglePhotoSelection(this.photoList[index].id);
          return;
        }
        const urls = this.photoList.map((photo) => photo.image_url);
        uni.previewImage({
          current: index,
          urls,
          indicator: "number",
          loop: true
        });
      },
      goBack() {
        uni.navigateBack({
          delta: 1,
          animationType: "slide-out-left"
        });
      },
      uploadPhotos() {
        uni.chooseImage({
          count: 9,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"],
          success: async (res) => {
            const tempFilePaths = res.tempFilePaths;
            uni.showLoading({
              title: "上传中...",
              mask: true
            });
            try {
              const token = uni.getStorageSync("token");
              const uploadPromises = tempFilePaths.map((filePath, index) => {
                return new Promise((resolve, reject) => {
                  uni.uploadFile({
                    url: `${cfg.base_url}/photo/upload/`,
                    filePath,
                    name: "image",
                    formData: {
                      album_id: this.albumId,
                      name: `照片_${index + 1}`
                    },
                    header: {
                      "token": token
                    },
                    success: (res2) => {
                      const data = JSON.parse(res2.data);
                      resolve(data);
                    },
                    fail: reject
                  });
                });
              });
              const results = await Promise.all(uploadPromises);
              uni.showToast({
                title: `成功上传 ${results.length} 张照片`,
                icon: "success"
              });
              this.loadPhotos(true);
            } catch (error) {
              formatAppLog("error", "at pages/detailPic/detailPic.vue:389", "上传失败:", error);
              uni.showToast({
                title: "上传失败",
                icon: "error"
              });
            } finally {
              uni.hideLoading();
            }
          }
        });
      },
      editAlbum() {
        uni.showModal({
          title: "编辑相册",
          content: "请输入新的相册名称",
          editable: true,
          placeholderText: this.album.name,
          success: async (res) => {
            if (res.confirm && res.content.trim()) {
              try {
                const token = uni.getStorageSync("token");
                await request({
                  url: `${cfg.base_url}/album/${this.albumId}/`,
                  method: "PUT",
                  header: {
                    "token": `${token}`,
                    "Content-Type": "application/json"
                  },
                  data: {
                    name: res.content.trim(),
                    detail: this.album.detail,
                    is_public: this.album.is_public
                  }
                });
                uni.showToast({
                  title: "修改成功",
                  icon: "success"
                });
                this.loadAlbumDetail();
              } catch (error) {
                formatAppLog("error", "at pages/detailPic/detailPic.vue:433", "修改失败:", error);
                uni.showToast({
                  title: "修改失败",
                  icon: "error"
                });
              }
            }
          }
        });
      },
      shareAlbum() {
        uni.showActionSheet({
          itemList: ["分享给好友", "生成分享链接", "保存到相册"],
          success: (res) => {
            if (res.tapIndex === 0) {
              uni.share({
                provider: "weixin",
                scene: "WXSceneSession",
                type: 0,
                title: `分享相册：${this.album.name}`,
                summary: this.album.detail || "一起来看我的相册吧",
                href: `https://your-domain.com/share/album/${this.albumId}`,
                success: function(res2) {
                  formatAppLog("log", "at pages/detailPic/detailPic.vue:458", "share success");
                },
                fail: function(err) {
                  formatAppLog("log", "at pages/detailPic/detailPic.vue:461", "share fail", err);
                }
              });
            } else if (res.tapIndex === 1) {
              const shareLink = `https://your-domain.com/share/album/${this.albumId}`;
              uni.setClipboardData({
                data: shareLink,
                success: () => {
                  uni.showToast({
                    title: "链接已复制",
                    icon: "success"
                  });
                }
              });
            }
          }
        });
      },
      showMoreActions() {
        uni.showActionSheet({
          itemList: ["设为封面", "导出相册", "删除相册"],
          success: async (res) => {
            if (res.tapIndex === 0) {
              this.setCoverPhoto();
            } else if (res.tapIndex === 2) {
              this.deleteAlbum();
            }
          }
        });
      },
      enterSelectionMode() {
        this.selectionMode = true;
        this.selectedPhotos = [];
      },
      exitSelectionMode() {
        this.selectionMode = false;
        this.selectedPhotos = [];
      },
      togglePhotoSelection(photoId) {
        const index = this.selectedPhotos.indexOf(photoId);
        if (index > -1) {
          this.selectedPhotos.splice(index, 1);
        } else {
          this.selectedPhotos.push(photoId);
        }
        if (this.selectedPhotos.length === 0) {
          this.exitSelectionMode();
        }
      },
      async deleteSelectedPhotos() {
        if (this.selectedPhotos.length === 0)
          return;
        uni.showModal({
          title: "确认删除",
          content: `确定要删除选中的 ${this.selectedPhotos.length} 张照片吗？`,
          success: async (res) => {
            if (res.confirm) {
              uni.showLoading({
                title: "删除中...",
                mask: true
              });
              try {
                const token = uni.getStorageSync("token");
                const deletePromises = this.selectedPhotos.map(
                  (photoId) => request({
                    url: `${cfg.base_url}/photo/${photoId}/`,
                    method: "DELETE",
                    header: {
                      "token": token
                    }
                  })
                );
                await Promise.all(deletePromises);
                uni.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                this.loadPhotos(true);
                this.exitSelectionMode();
              } catch (error) {
                formatAppLog("error", "at pages/detailPic/detailPic.vue:557", "删除失败:", error);
                uni.showToast({
                  title: "删除失败",
                  icon: "error"
                });
              } finally {
                uni.hideLoading();
              }
            }
          }
        });
      },
      downloadSelectedPhotos() {
        if (this.selectedPhotos.length === 0)
          return;
        uni.showModal({
          title: "下载照片",
          content: `确定要下载选中的 ${this.selectedPhotos.length} 张照片到本地吗？`,
          success: (res) => {
            if (res.confirm) {
              uni.showLoading({
                title: "下载中..."
              });
              setTimeout(() => {
                uni.hideLoading();
                uni.showToast({
                  title: "下载完成",
                  icon: "success"
                });
              }, 2e3);
            }
          }
        });
      },
      async deleteAlbum() {
        uni.showModal({
          title: "删除相册",
          content: "确定要删除这个相册吗？删除后所有照片将丢失。",
          success: async (res) => {
            if (res.confirm) {
              try {
                const token = uni.getStorageSync("token");
                await request({
                  url: `${cfg.base_url}/album/${this.albumId}/`,
                  method: "DELETE",
                  header: {
                    "token": token
                  }
                });
                uni.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
              } catch (error) {
                formatAppLog("error", "at pages/detailPic/detailPic.vue:623", "删除失败:", error);
                uni.showToast({
                  title: "删除失败",
                  icon: "error"
                });
              }
            }
          }
        });
      },
      formatDate(dateString) {
        if (!dateString)
          return "";
        const date = new Date(dateString);
        const now = /* @__PURE__ */ new Date();
        const diffDays = Math.floor((now - date) / (1e3 * 60 * 60 * 24));
        if (diffDays === 0)
          return "今天创建";
        if (diffDays === 1)
          return "昨天创建";
        if (diffDays < 7)
          return `${diffDays}天前创建`;
        if (diffDays < 30)
          return `${Math.floor(diffDays / 7)}周前创建`;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        if (year === now.getFullYear()) {
          return `${month}月${day}日创建`;
        }
        return `${year}年${month}月${day}日创建`;
      },
      formatPhotoDate(dateString) {
        if (!dateString)
          return "";
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
      },
      setCoverPhoto() {
        uni.showToast({
          title: "请选择一张照片作为封面",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = vue.resolveComponent("uni-icons");
    const _component_uni_load_more = vue.resolveComponent("uni-load-more");
    return vue.openBlock(), vue.createElementBlock("view", { class: "album-detail-container" }, [
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["album-header", { "with-cover": $data.album.cover_photo }])
        },
        [
          $data.album.cover_photo ? (vue.openBlock(), vue.createElementBlock("image", {
            key: 0,
            class: "album-cover-background",
            src: $data.album.cover_photo,
            mode: "aspectFill"
          }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "album-cover-overlay" }),
          vue.createElementVNode("view", { class: "album-header-content" }, [
            vue.createElementVNode(
              "text",
              { class: "album-title" },
              vue.toDisplayString($data.album.name),
              1
              /* TEXT */
            ),
            $data.album.detail ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "album-description"
              },
              vue.toDisplayString($data.album.detail),
              1
              /* TEXT */
            )) : (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "album-no-description"
            }, " 暂无描述 ")),
            vue.createElementVNode("view", { class: "album-stats" }, [
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createVNode(_component_uni_icons, {
                  type: "calendar",
                  size: "28",
                  color: "#fff"
                }),
                vue.createElementVNode(
                  "text",
                  { class: "stat-text" },
                  vue.toDisplayString($options.formatDate($data.album.created_at)),
                  1
                  /* TEXT */
                )
              ]),
              $data.album.user && $data.album.user.username ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "stat-item"
              }, [
                vue.createVNode(_component_uni_icons, {
                  type: "person",
                  size: "28",
                  color: "#fff"
                }),
                vue.createElementVNode(
                  "text",
                  { class: "stat-text" },
                  vue.toDisplayString($data.album.user.username),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ])
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode("view", { class: "action-toolbar" }, [
        vue.createElementVNode("view", {
          class: "action-item",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.uploadPhotos && $options.uploadPhotos(...args))
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "plus",
            size: "32",
            color: "#667eea"
          }),
          vue.createElementVNode("text", { class: "action-text" }, "添加照片")
        ]),
        vue.createElementVNode("view", {
          class: "action-item",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.editAlbum && $options.editAlbum(...args))
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "compose",
            size: "32",
            color: "#667eea"
          }),
          vue.createElementVNode("text", { class: "action-text" }, "编辑相册")
        ]),
        vue.createElementVNode("view", {
          class: "action-item",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.shareAlbum && $options.shareAlbum(...args))
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "redo",
            size: "32",
            color: "#667eea"
          }),
          vue.createElementVNode("text", { class: "action-text" }, "分享")
        ]),
        vue.createElementVNode("view", {
          class: "action-item",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.showMoreActions && $options.showMoreActions(...args))
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "more-filled",
            size: "32",
            color: "#667eea"
          }),
          vue.createElementVNode("text", { class: "action-text" }, "更多")
        ])
      ]),
      vue.createElementVNode("view", { class: "photo-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "所有照片"),
          vue.createElementVNode(
            "text",
            { class: "photo-count" },
            vue.toDisplayString($data.photoList.length) + " 张",
            1
            /* TEXT */
          )
        ]),
        $data.photoList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "photo-grid"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.photoList, (photo, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "photo-item",
                key: photo.id || index,
                onClick: ($event) => $options.previewPhoto(index)
              }, [
                vue.createElementVNode("image", {
                  class: "photo-image",
                  src: photo.image,
                  mode: "aspectFill",
                  "lazy-load": true
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "photo-overlay" }, [
                  photo.name ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "photo-name"
                    },
                    vue.toDisplayString(photo.name),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true),
                  photo.created_at ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 1,
                      class: "photo-date"
                    },
                    vue.toDisplayString($options.formatPhotoDate(photo.created_at)),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true)
                ]),
                $data.selectionMode ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: vue.normalizeClass(["selection-marker", { "selected": $data.selectedPhotos.includes(photo.id) }])
                  },
                  [
                    $data.selectedPhotos.includes(photo.id) ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                      key: 0,
                      type: "checkmark-filled",
                      size: "24",
                      color: "#fff"
                    })) : vue.createCommentVNode("v-if", true)
                  ],
                  2
                  /* CLASS */
                )) : vue.createCommentVNode("v-if", true)
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : !$data.photoLoading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-photos"
        }, [
          vue.createElementVNode("image", {
            class: "empty-photo-image",
            src: _imports_0,
            mode: "widthFix"
          }),
          vue.createElementVNode("text", { class: "empty-photo-title" }, "还没有照片"),
          vue.createElementVNode("text", { class: "empty-photo-subtitle" }, '点击"添加照片"上传第一张照片'),
          vue.createElementVNode("button", {
            class: "upload-button",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.uploadPhotos && $options.uploadPhotos(...args))
          }, " 上传照片 ")
        ])) : vue.createCommentVNode("v-if", true),
        $data.photoLoading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "photo-loading"
        }, [
          vue.createVNode(_component_uni_load_more, { status: "loading" })
        ])) : vue.createCommentVNode("v-if", true),
        $data.photoList.length > 0 && $data.photoHasMore ? (vue.openBlock(), vue.createElementBlock("view", { key: 3 }, [
          vue.createVNode(_component_uni_load_more, {
            status: $data.photoLoadMoreStatus,
            onClickLoadMore: $options.loadMorePhotos
          }, null, 8, ["status", "onClickLoadMore"])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      $data.selectionMode ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "batch-action-bar"
      }, [
        vue.createElementVNode(
          "view",
          { class: "selected-count" },
          " 已选择 " + vue.toDisplayString($data.selectedPhotos.length) + " 张照片 ",
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "batch-actions" }, [
          vue.createElementVNode("button", {
            class: "batch-action-btn delete",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.deleteSelectedPhotos && $options.deleteSelectedPhotos(...args))
          }, " 删除 "),
          vue.createElementVNode("button", {
            class: "batch-action-btn download",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.downloadSelectedPhotos && $options.downloadSelectedPhotos(...args))
          }, " 下载 ")
        ])
      ])) : vue.createCommentVNode("v-if", true),
      !$data.selectionMode ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "bottom-action-bar"
      }, [
        vue.createElementVNode("button", {
          class: "select-btn",
          onClick: _cache[7] || (_cache[7] = (...args) => $options.enterSelectionMode && $options.enterSelectionMode(...args))
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "checkbox",
            size: "28"
          }),
          vue.createElementVNode("text", null, "选择")
        ]),
        vue.createElementVNode("button", {
          class: "upload-fab",
          onClick: _cache[8] || (_cache[8] = (...args) => $options.uploadPhotos && $options.uploadPhotos(...args))
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "camera-filled",
            size: "36",
            color: "#fff"
          })
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "loading-overlay"
      }, [
        vue.createVNode(_component_uni_load_more, {
          status: "loading",
          "icon-size": 48
        })
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesDetailPicDetailPic = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-cf1fa90b"], ["__file", "E:/code/geng_xin/front/pages/detailPic/detailPic.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/album/album", PagesAlbumAlbum);
  __definePage("pages/self/self", PagesSelfSelf);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/detailPic/detailPic", PagesDetailPicDetailPic);
  const whiteList = ["/pages/login/login", "/pages/register/register", "/pages/index/index"];
  function createRouterGuard() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const route = currentPage ? currentPage.route : "";
    const fullPath = `/${route}`;
    if (whiteList.includes(fullPath)) {
      return true;
    }
    const token = uni.getStorageSync("token");
    const username = uni.getStorageSync("username");
    formatAppLog("log", "at utils/routeInterceptor.js:21", 123);
    if (!token || !username) {
      uni.redirectTo({
        url: "/pages/login/login",
        success: () => {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
        }
      });
      return false;
    }
    return true;
  }
  const _sfc_main = {
    onLaunch() {
      this.checkLoginStatus();
    },
    onShow() {
      createRouterGuard();
    },
    methods: {
      checkLoginStatus() {
      }
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "E:/code/geng_xin/front/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
