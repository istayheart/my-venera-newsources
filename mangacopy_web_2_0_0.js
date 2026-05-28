class MangaCopy extends ComicSource {
    name = "MangaCopy"
    key = "mangacopy"
    version = "2.0.0"
    minAppVersion = "1.6.0"
    url = "https://cdn.jsdelivr.net/gh/istayheart/my-venera-newsources@main/mangacopy_web_2_0_0.js"

    baseUrl = "https://www.mangacopy.com"
    pageLimit = 50

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
        "Referer": "https://www.mangacopy.com/"
    }

    imageHeaders = {
        "Referer": "https://www.mangacopy.com/"
    }

    static categoryParamDict = {
        "All": "",
        "Romance": "aiqing",
        "Comedy": "huanlexiang",
        "Adventure": "maoxian",
        "Fantasy": "qihuan",
        "Yuri": "baihe",
        "School": "xiaoyuan",
        "Sci-Fi": "kehuan",
        "Touhou": "dongfang",
        "BL": "danmei",
        "Slice of Life": "shenghuo",
        "Action": "gedou",
        "Light Novel": "qingxiaoshuo",
        "Suspense": "xuanyi",
        "Other": "qita",
        "Supernatural": "shengui",
        "Workplace": "zhichang",
        "TL": "teenslove",
        "Moe": "mengxi",
        "Healing": "zhiyu",
        "Webtoon": "changtiao",
        "4-Koma": "sige",
        "Gag": "gaoxiao",
        "Hot Blooded": "rexue",
        "Inspirational": "lizhi",
        "Gender Bender": "xingzhuanhuan",
        "Color": "COLOR",
        "Harem": "hougong",
        "Food": "meishi",
        "Detective": "zhentan",
        "AA": "aa",
        "Music": "yinyuewudao",
        "Magic": "mohuan",
        "War": "zhanzheng",
        "History": "lishi",
        "Isekai": "yishijie",
        "Thriller": "jingsong",
        "Mecha": "jizhan",
        "Urban": "dushi",
        "Time Travel": "chuanyue",
        "Horror": "kongbu",
        "Rebirth": "chongsheng",
        "Wuxia": "wuxia",
        "Reincarnation": "zhuansheng",
        "Uncensored": "Uncensored",
        "Xianxia": "xianxia",
        "LoveLive": "loveLive"
    }

    explore = [
        {
            title: "Latest",
            type: "multiPageComicList",
            load: async (page) => {
                return await this.loadComicsPage(`${this.baseUrl}/comics?ordering=-datetime_updated`, page)
            }
        },
        {
            title: "Ranking",
            type: "multiPageComicList",
            load: async (page) => {
                return await this.loadRankingPage("male-day", page)
            }
        }
    ]

    category = {
        title: "MangaCopy",
        parts: [
            {
                name: "Ranking",
                type: "fixed",
                categories: ["Ranking"],
                categoryParams: ["ranking"],
                itemType: "category"
            },
            {
                name: "Theme",
                type: "fixed",
                categories: Object.keys(MangaCopy.categoryParamDict),
                categoryParams: Object.values(MangaCopy.categoryParamDict),
                itemType: "category"
            }
        ],
        enableRankingPage: true
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            if (param === "ranking") {
                return await this.loadRankingPage(`${options[0]}-${options[1]}`, page)
            }

            let ordering = options[0] || "-datetime_updated"
            let url = `${this.baseUrl}/comics?ordering=${encodeURIComponent(ordering)}`
            if (param) {
                url += `&theme=${encodeURIComponent(param)}`
            }
            return await this.loadComicsPage(url, page)
        },
        optionList: [
            {
                options: [
                    "-datetime_updated-Updated",
                    "-popular-Popular",
                    "-datetime_created-Created"
                ],
                notShowWhen: ["ranking"]
            },
            {
                options: [
                    "male-Male",
                    "female-Female"
                ],
                showWhen: ["ranking"]
            },
            {
                options: [
                    "day-Day",
                    "week-Week",
                    "month-Month",
                    "total-Total"
                ],
                showWhen: ["ranking"]
            }
        ],
        ranking: {
            options: [
                "male-day-Male Day",
                "male-week-Male Week",
                "male-month-Male Month",
                "female-day-Female Day",
                "female-week-Female Week",
                "female-month-Female Month"
            ],
            load: async (option, page) => {
                return await this.loadRankingPage(option, page)
            }
        }
    }

    search = {
        load: async (keyword, options, page) => {
            let qType = options && options[0] && options[0] !== "all" ? options[0] : ""
            let limit = 12
            let offset = (page - 1) * limit
            let url = `${this.baseUrl}/api/kb/web/searchci/comics?offset=${offset}&platform=2&limit=${limit}&q=${encodeURIComponent(keyword)}&q_type=${encodeURIComponent(qType)}`
            let data = await this.getJson(url)
            let results = data.results || {}
            return {
                comics: this.parseComicObjects(results.list || []),
                maxPage: this.maxPage(results.total || 0, limit)
            }
        },
        optionList: [
            {
                type: "select",
                options: [
                    "all-All",
                    "name-Title",
                    "author-Author"
                ],
                label: "Search",
                default: ""
            }
        ]
    }

    comic = {
        loadInfo: async (id) => {
            let detailUrl = `${this.baseUrl}/comic/${encodeURIComponent(id)}`
            let html = await this.getText(detailUrl)

            let title = this.htmlDecode(this.firstMatch(html, /<h6[^>]*title="([^"]*)"[^>]*>/) || this.firstMatch(html, /<h6[^>]*>([\s\S]*?)<\/h6>/) || id)
            let cover = this.htmlDecode(this.firstMatch(html, /<img[^>]+class="lazyload"[^>]+data-src="([^"]+)"/) || "")
            let authors = this.matchAll(html, /<a href="\/author\/[^"]+\/comics"[^>]*>([\s\S]*?)<\/a>/g).map(e => this.cleanText(e))
            let tagBlock = this.firstMatch(html, /<span class="comicParticulars-left-theme-all comicParticulars-tag">([\s\S]*?)<\/span>/) || ""
            let tags = this.matchAll(tagBlock, /<a[^>]*>#?([\s\S]*?)<\/a>/g).map(e => this.cleanText(e))
            let updateTime = ""
            let status = ""
            let description = this.cleanText(this.firstMatch(html, /<p class="intro"[^>]*>([\s\S]*?)<\/p>/) || "")
            let ccz = this.firstMatch(html, /var\s+ccz\s*=\s*'([^']+)'/) || "op0zzpvv.nmn.00p"
            let dnts = this.firstMatch(html, /<span id="dnt"[^>]*value="([^"]*)"/) || "3"

            let chapterData = await this.loadChapterData(id, ccz, dnts)
            let chapters = this.buildChapterMap(chapterData)

            return {
                title: title,
                cover: cover,
                description: description,
                tags: {
                    "Author": authors,
                    "Updated": updateTime ? [updateTime] : [],
                    "Tags": tags,
                    "Status": status ? [status] : []
                },
                chapters: chapters,
                isFavorite: false,
                subId: id,
                updateTime: updateTime,
                url: detailUrl
            }
        },
        loadEp: async (comicId, epId) => {
            let url = `${this.baseUrl}/comic/${encodeURIComponent(comicId)}/chapter/${encodeURIComponent(epId)}`
            let html = await this.getText(url)
            let cct = this.firstMatch(html, /var\s+cct\s*=\s*'([^']+)'/) || "op0zzpvv.nmn.00p"
            let contentKey = this.firstMatch(html, /var\s+contentKey\s*=\s*'([^']+)'/)
            if (!contentKey) {
                throw "Chapter image data not found"
            }
            let data = this.decryptWebPayload(contentKey, cct)
            let images = this.parseImages(data)
            if (images.length === 0) {
                throw "Chapter images are empty"
            }
            return {images: images}
        },
        onImageLoad: (url, comicId, epId) => {
            return {headers: this.imageHeaders}
        },
        onThumbnailLoad: (url) => {
            return {headers: this.imageHeaders}
        }
    }

    async getText(url, headers) {
        let res = await Network.get(url, headers || this.headers)
        if (res.status !== 200) {
            throw `Invalid status code: ${res.status}`
        }
        return res.body
    }

    async getJson(url, headers) {
        let text = await this.getText(url, headers)
        let data = JSON.parse(text)
        if (data.code && data.code !== 200) {
            throw data.message || `Invalid response code: ${data.code}`
        }
        return data
    }

    async loadComicsPage(baseUrl, page) {
        let separator = baseUrl.includes("?") ? "&" : "?"
        let url = `${baseUrl}${separator}offset=${(page - 1) * this.pageLimit}&limit=${this.pageLimit}`
        let html = await this.getText(url)
        return this.parseComicsHtmlPage(html)
    }

    async loadRankingPage(option, page) {
        let [type, table] = option.split("-")
        type = type || "male"
        table = table || "day"
        let url = `${this.baseUrl}/rank?type=${encodeURIComponent(type)}&table=${encodeURIComponent(table)}`
        let html = await this.getText(url)
        let comics = this.parseRankingHtml(html)
        return {
            comics: comics,
            maxPage: 1
        }
    }

    async loadChapterData(id, key, dnts) {
        let url = `${this.baseUrl}/comicdetail/${encodeURIComponent(id)}/chapters`
        let data = await this.getJson(url, {
            ...this.headers,
            "dnts": dnts || "3",
            "Accept": "application/json,text/plain,*/*"
        })
        if (!data.results) {
            throw "Chapter list is empty"
        }
        return this.decryptWebPayload(data.results, key)
    }

    parseComicsHtmlPage(html) {
        let block = this.firstMatch(html, /<div class="row exemptComic-box"[^>]*>/)
        let total = 0
        let list = []
        if (block) {
            total = parseInt(this.firstMatch(block, /total="([^"]*)"/) || "0")
            let rawList = this.firstMatch(block, /list="([^"]*)"/)
            if (rawList) {
                list = this.parseHtmlListAttribute(rawList)
            }
        }
        return {
            comics: this.parseComicObjects(list),
            maxPage: this.maxPage(total, this.pageLimit)
        }
    }

    parseRankingHtml(html) {
        let results = []
        let items = html.match(/<li class="col-4">[\s\S]*?<\/li>/g) || []
        for (let item of items) {
            let id = this.firstMatch(item, /href="\/comic\/([^"]+)"/)
            if (!id) continue
            let title = this.cleanText(this.firstMatch(item, /<p class="threeLines"[^>]*title="([^"]*)"[^>]*>/) || "")
            let cover = this.htmlDecode(this.firstMatch(item, /<img[^>]+data-src="([^"]+)"/) || "")
            let author = this.cleanText(this.firstMatch(item, /<span class="comic-author">([\s\S]*?)<\/span>/) || "")
            results.push(new Comic({
                id: id,
                title: title || id,
                subtitle: author,
                cover: cover,
                tags: []
            }))
        }
        return results
    }

    parseHtmlListAttribute(rawList) {
        let decoded = this.htmlDecode(rawList)
        try {
            return Function(`"use strict"; return (${decoded});`)()
        } catch (e) {
            let json = decoded.replace(/'/g, "\"")
            return JSON.parse(json)
        }
    }

    parseComicObjects(list) {
        return (list || []).map(item => {
            let authors = (item.author || []).map(e => e.name).filter(e => !!e)
            let tags = (item.theme || []).map(e => e.name).filter(e => !!e)
            return new Comic({
                id: item.path_word,
                title: item.name || item.path_word,
                subtitle: authors.join(", "),
                cover: item.cover || "",
                tags: tags,
                description: item.brief || ""
            })
        })
    }

    buildChapterMap(data) {
        let groups = data.groups || {}
        let groupKeys = Object.keys(groups).filter(key => (groups[key].chapters || []).length > 0)
        if (groupKeys.length === 0) {
            return new Map()
        }

        if (groupKeys.length === 1) {
            let chapterMap = new Map()
            for (let chapter of groups[groupKeys[0]].chapters || []) {
                chapterMap.set(chapter.id, chapter.name)
            }
            return chapterMap
        }

        let result = new Map()
        for (let key of groupKeys) {
            let group = groups[key]
            let chapterMap = new Map()
            for (let chapter of group.chapters || []) {
                chapterMap.set(chapter.id, chapter.name)
            }
            result.set(group.name || key, chapterMap)
        }
        return result
    }

    parseImages(data) {
        if (Array.isArray(data)) {
            return data.map(e => typeof e === "string" ? e : e.url).filter(e => !!e)
        }
        if (Array.isArray(data.contents)) {
            return data.contents.map(e => typeof e === "string" ? e : e.url).filter(e => !!e)
        }
        if (data.chapter && Array.isArray(data.chapter.contents)) {
            return data.chapter.contents.map(e => typeof e === "string" ? e : e.url).filter(e => !!e)
        }
        if (Array.isArray(data.images)) {
            return data.images.map(e => typeof e === "string" ? e : e.url).filter(e => !!e)
        }
        return []
    }

    decryptWebPayload(value, keyText) {
        let ivText = value.substring(0, 16)
        let cipherHex = value.substring(16)
        let plainBytes = Convert.decryptAesCbc(
            this.hexDecode(cipherHex),
            Convert.encodeUtf8(keyText),
            Convert.encodeUtf8(ivText)
        )
        let plainText = Convert.decodeUtf8(plainBytes).trim()
        return JSON.parse(plainText)
    }

    hexDecode(hex) {
        if (hex.length % 2 !== 0) {
            throw "Invalid hex data"
        }
        let bytes = new Uint8Array(hex.length / 2)
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
        }
        return bytes.buffer
    }

    firstMatch(text, regex) {
        let match = text.match(regex)
        return match ? match[1] : null
    }

    matchAll(text, regex) {
        let result = []
        let match
        while ((match = regex.exec(text)) !== null) {
            result.push(match[1])
        }
        return result
    }

    cleanText(text) {
        return this.htmlDecode(String(text || "")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim())
    }

    htmlDecode(text) {
        return String(text || "")
            .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
            .replace(/&quot;/g, "\"")
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&nbsp;/g, " ")
    }

    maxPage(total, limit) {
        total = parseInt(total || 0)
        if (!total) return 1
        return Math.max(1, Math.ceil(total / limit))
    }
}
