<template>
  <div>
    <AppTitle :title="title" />
    <div v-if="!isDir" id="buttons">
      <button class="btn_ bbutton" @click="scrollToPrev">BACK</button><br />
      <button class="btn_ to_top" @click="toTop">TOPへ</button><br />
      <a :href="`\/?path=${originalPath}&page=${nextPage - 1}&max=1`">
        1ページずつ開く </a
      ><br />
      <!-- |
      <a :href="`\/?path=${originalPath}&page=${nextPage - 1}&editMode=true`">
        編集 </a
      ><br /> -->
      <a :href="`/?path=${upperPath}`">フォルダに戻る</a>
    </div>

    <div class="w-full flex flex-col items-center">
      <br /><br />
      <div v-if="isDir" class="w-full flex flex-col items-center">
        <h1 class="font-bold">動画ビューワー</h1>
        <a href="/">ホーム</a><br />
        <br /><br />
        <a v-if="upperPath !== `/`" :href="`/?path=${upperPath}`"
          >上のフォルダへ
        </a>
        <div v-for="(dir, index) in dirList" :key="index + '1'">
          <a :href="`/?path=${dir.Prefix}`" class="text-blue-600 text-xl">{{
            formattedPrefix(dir.Prefix)
          }}</a
          ><br /><br />
        </div>
      </div>
      <!-- 以下各画像表示 -->
      <div
        v-else
        class="w-full flex flex-col items-center"
        style="margin-bottom: 400px"
      >
        <a :href="`/?path=${upperPath}`">　戻る　</a>
        <div>
          <span
            v-for="(num, index) in allPageNum"
            :key="num + 'page'"
            class="inline"
          >
            <a :href="`/?path=${originalPath}&page=${index}&max=${maxPage}`">
              {{ num * maxPage + 1 }}～
            </a>
            |
          </span>
        </div>
        <div v-for="(image, index) in imageList" :key="index + '1'">
          <p class="w-full flex flex-row-reverse p-3">
            <AppCopyForm v-if="editMode" :path="`${image}`" />
          </p>
          <div ref="images" @click="scrollToNext">
            <video preload="none" controls>
              <source :src="`${baseUrl}${image}`" />
            </video>
            <p>{{ formattedPrefix(image) }}</p>
          </div>
        </div>
        <div v-show="lastPageNum - 1 !== page" ref="imageLast" class="mb-48">
          <a :href="`/?path=${originalPath}&page=${nextPage}&max=${maxPage}`">
            <img src="~/static/t.png" />
          </a>
        </div>
      </div>

      <br />
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from '@vue/composition-api'
import axios from 'axios'
import $ from '~/static/jquery.min.js'

const _maxPage = 40
const baseUrl = process.env.S3_BASE_URL
const apiBaseUrl = process.env.API_BASE_URL
export default {
  setup(_props: {}, ctx: any) {
    const originalPath = ref(ctx.root.context.query?.path ?? '')
    // const maxPage = ref(Number(ctx.root.context.query?.max ?? _maxPage))
    const maxPage = ref(Number(ctx.root.context.query?.max ?? _maxPage))
    const path = originalPath.value

    const page = ref(Number(ctx.root.context.query?.page ?? 0))
    const nextPage = ref(page.value + 1)
    const editMode = ref(true)

    const imageList = ref([])
    const dirList = ref([])
    const isDir = ref(false)

    const tmpDirs = originalPath.value.split('/')
    const joined = tmpDirs
      .slice(0, tmpDirs.length - 3 > 0 ? tmpDirs.length - 2 : 1)
      .join('/')

    const title = ref(tmpDirs[tmpDirs.length - 2])
    const upperPath = ref(joined + '/')
    const allPageNum = ref<Number[]>([])
    const lastPageNum = ref(0)
    const url1 = ref('')
    const error: any = ref('')

    const formattedPrefix = (prefix: string) => {
      const matches = prefix.match('.+/(.+?)([\?#;].*)?/$')
      if (matches === null) return prefix
      const folderName = matches.length > 1 ? matches[1] : ''
      return folderName
    }
    const toTop = () => {
      $('body,html').animate(
        {
          scrollTop: 0,
        },
        200
      )
      return false
    }
    const scrollToPrev = () => {
      let target
      let prev

      for (const imageObject of ctx.refs.images) {
        target = imageObject.offsetTop
        if (target > $(document).scrollTop() - 10) {
          break
        }
        prev = target
      }

      $('html, body').animate(
        {
          scrollTop: prev,
        },
        200
      )
    }

    const scrollToNext = () => {
      let target
      for (const imageObject of ctx.refs.images) {
        target = imageObject.offsetTop
        if (target - 10 > $(document).scrollTop()) {
          break
        }
      }
      if (target <= $(document).scrollTop()) {
        target = ctx.refs.imageLast.offsetTop
      }
      $('html, body').animate(
        {
          scrollTop: target,
        },
        200
      )
    }

    onMounted(async () => {
      const url = `${apiBaseUrl}?path=${path}`
      url1.value = url
      let res: any = null
      try {
        res = await axios(url)
        console.log(res)
      } catch (e) {
        error.value = e
        alert(`${e.message}`)
      }
      if (res.data.type === 'dir') isDir.value = true
      dirList.value = res.data.list
      const lastImageNum = res.data.list.length - 1
      const currentPageLastNum =
        page.value * maxPage.value + maxPage.value > lastImageNum
          ? lastImageNum + 1
          : page.value * maxPage.value + maxPage.value
      if (isDir.value === false) {
        const tmpImageList = res.data.list.map((value: any) =>
          value.Key.replace(/ /g, '+')
            .replace(/#/g, '%23')
            .replace(/\[/g, '%5B')
            .replace(/\]/g, '%5D')
        )
        imageList.value = tmpImageList.slice(
          page.value * maxPage.value,
          currentPageLastNum
        )
      }
      allPageNum.value = [
        ...Array(Math.floor(res.data.list.length / maxPage.value) + 1).keys(),
      ]
      lastPageNum.value = allPageNum.value.length
    })
    return {
      title,
      error,
      imageList,
      editMode,
      maxPage,
      dirList,
      isDir,
      baseUrl,
      page,
      url1,
      nextPage,
      originalPath,
      upperPath,
      scrollToNext,
      toTop,
      scrollToPrev,
      allPageNum,
      lastPageNum,
      formattedPrefix,
    }
  },
}
</script>
<style scoped>
@media screen and (min-width: 320px) {
  img {
    width: 100%;
  }
  video {
    width: 100%;
  }
}
</style>
