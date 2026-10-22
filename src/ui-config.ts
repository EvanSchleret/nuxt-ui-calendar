const border = 'border-black/8 dark:border-white/10'
const divide = 'divide-black/8 dark:divide-white/8'

export const uiDefaults = {
  colors: {
    primary: 'red',
    neutral: 'zinc'
  },
  commandPalette: {
    slots: {
      root: divide
    },
    variants: {
      virtualize: {
        false: {
          viewport: divide
        }
      }
    }
  },
  inputDate: {
    slots: {
      base: 'gap-0!',
      segment: 'w-auto! px-0.5'
    },
    compoundVariants: [{
      color: 'primary',
      variant: 'none',
      class: {
        segment: 'focus:bg-primary focus:text-white'
      }
    }]
  },
  inputTime: {
    slots: {
      base: 'gap-0!',
      segment: 'w-auto! px-0.5'
    },
    compoundVariants: [{
      color: 'primary',
      variant: 'none',
      class: {
        segment: 'focus:bg-primary focus:text-white'
      }
    }]
  },
  navigationMenu: {
    slots: {
      link: 'hover:before:bg-(--control-bg-hover)'
    },
    compoundVariants: [{
      disabled: false,
      active: false,
      variant: 'pill',
      class: {
        link: 'hover:before:bg-(--control-bg)'
      }
    }]
  },
  select: {
    slots: {
      item: 'data-highlighted:not-data-disabled:before:bg-(--control-bg)'
    },
    variants: {
      variant: {
        soft: 'bg-(--control-bg) hover:bg-(--control-bg-hover) focus:bg-(--control-bg-hover) disabled:bg-(--control-bg)'
      }
    }
  },
  sidebar: {
    slots: {
      body: 'p-2 gap-2',
      footer: ['p-2 border-t', border]
    }
  },
  slideover: {
    compoundVariants: [{
      side: 'top',
      inset: true,
      class: {
        content: 'max-h-[calc(100%-1rem)] inset-x-2 top-2'
      }
    }, {
      side: 'right',
      inset: true,
      class: {
        content: 'w-[calc(100%-1rem)] inset-y-2 right-2'
      }
    }, {
      side: 'bottom',
      inset: true,
      class: {
        content: 'max-h-[calc(100%-1rem)] inset-x-2 bottom-2'
      }
    }, {
      side: 'left',
      inset: true,
      class: {
        content: 'w-[calc(100%-1rem)] inset-y-2 left-2'
      }
    }]
  },
}
