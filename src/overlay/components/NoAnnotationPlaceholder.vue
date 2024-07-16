<template>
  <div class="card no-annotation">
    <img class="card-img-top" :src="image" alt="Card cap" />
    <div class="card-body text-center">
      <h5 class="card-title">You do not have any annotation for this page! ;-)</h5>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoAnnotationPlaceholder',
  data() {
    return {
      image: chrome.runtime.getURL('icons/notfound.png'),
    };
  },
};
</script>

<style scoped lang="scss">
.card.no-annotation {
  width: 358px !important;
}
</style>
