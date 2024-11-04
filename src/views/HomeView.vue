<script setup lang="ts">
import dataString from '@/assets/prapositionen.csv?raw'
import { parseString } from '@/utils/csv'
import { computed } from '@vue/reactivity'
import { ref, watch } from 'vue'

type Row = {
  Verben: string
  Prapositionen: string
  Casus: string
  Translation: string
  Example: string
}

const data: Array<Row> = parseString(dataString).map(r => ({
  Verben: r[0],
  Prapositionen: r[1],
  Casus: r[2],
  Translation: r[3],
  Example: r[4]?.substring(0, r[4].length - 1),
}))

const correct = ref<{ prapositionen: boolean; casus: boolean } | null>(null)
const prapositionen = ref('')
const casus = ref<'A' | 'D' | ''>('')

const currentRow = ref<Row>(populateNextWord())

function populateNextWord() {
  correct.value = null
  prapositionen.value = ''
  casus.value = ''
  const d = data[Math.floor(Math.random() * data.length)]
  return d
}

watch(currentRow, () => console.table(currentRow.value), { immediate: true })

function tryCasus(e: Event) {
  // @ts-expect-error wrong types
  casus.value = (e.submitter as HTMLButtonElement).name as 'A' | 'D'
  console.log(casus.value, e)

  if (otherAnswers.value.length > 0) {
    // see if the user has selected an answer in the list, and swap to that current word instead
    const otherAnswer = otherAnswers.value.find(
      r => r.Prapositionen.toLowerCase() === prapositionen.value.toLowerCase(),
    )

    if (otherAnswer) {
      console.log(
        `changed from ${currentRow.value.Prapositionen} to ${otherAnswer.Prapositionen}`,
      )
      currentRow.value = otherAnswer
    }
  }

  correct.value = {
    prapositionen:
      prapositionen.value.toLowerCase() ===
      currentRow.value.Prapositionen.toLowerCase(),
    casus: casus.value.toLowerCase() === currentRow.value.Casus.toLowerCase(),
  }
}

function getCasusString(casus: 'A' | 'D' | string) {
  if (casus === '') return ''
  return casus === 'A' ? 'Akkusativ' : 'Dativ'
}

const otherAnswers = computed(() => {
  const verb = currentRow.value.Verben
  const similarPraps = data
    .filter(r => r.Verben === verb)
    .filter(r => r.Prapositionen !== currentRow.value.Prapositionen)

  return similarPraps
})
</script>

<template>
  <main class="text-center py-8">
    <h1 className="text-xl mb-12">Verb Cards</h1>

    <div v-if="correct === null">
      <h2 className="text-3xl mb-12">{{ currentRow.Verben }}</h2>

      <form @submit.prevent="tryCasus">
        <input
          id="prapositionen"
          class="border px-2 py-1 mb-6 text-lg"
          name="prapositionen"
          placeholder="prapositionen"
          autocomplete="off"
          v-model="prapositionen"
          required
        />

        <div class="flex gap-4 justify-center">
          <button
            name="A"
            class="py-4 px-8 bg-red-600 text-white rounded mt-8 hover:bg-red-700"
          >
            Akkusativ
          </button>
          <button
            name="D"
            class="py-4 px-8 bg-cyan-600 text-white rounded mt-8 hover:bg-cyan-700"
          >
            Dativ
          </button>
        </div>
      </form>
    </div>

    <div v-else>
      <h2 className="text-3xl mb-12">{{ currentRow.Verben }}</h2>

      <div class="px-2 py-1 mb-6 text-lg">
        <span v-if="correct.prapositionen">✅</span>
        <span v-else>❌</span>
        <span
          class="ml-2"
          :class="
            !correct.prapositionen ? 'text-red-700' : 'text-green-700 font-bold'
          "
          >{{ prapositionen }}</span
        >

        <div v-if="!correct.prapositionen" class="text-cyan-700 font-bold">
          {{ currentRow.Prapositionen }}
        </div>

        <div class="mt-4 text-yellow-600" v-if="otherAnswers.length">
          <div v-for="o in otherAnswers" :key="o.Prapositionen">
            Also correct: <b>{{ o.Prapositionen }}</b>
          </div>
        </div>
      </div>

      <div class="flex gap-4 justify-center">
        <!-- display correct casus -->
        <div v-if="correct.casus">
          <span class="text-green-700 font-bold"
            >✅ {{ getCasusString(casus) }}</span
          >
        </div>
        <div v-else>
          <span class="text-red-700"
            >❌ {{ getCasusString(currentRow.Casus) }}</span
          >
          <div class="text-cyan-700 font-bold">
            {{ getCasusString(casus) }}
          </div>
        </div>
      </div>

      <div class="mt-4">
        Translation:
        <b>
          {{ currentRow.Translation }}
        </b>
      </div>

      <div class="mt-4 text-sm">
        <i>
          {{ currentRow.Example }}
        </i>
      </div>

      <button
        class="py-4 px-8 bg-red-600 text-white rounded mt-8 hover:bg-red-700"
        @click="currentRow = populateNextWord()"
      >
        Next
      </button>
    </div>
  </main>
</template>
