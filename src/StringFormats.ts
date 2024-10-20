const Email = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,
  Color = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

export default {
  email: {
    test: (val: unknown) => typeof val === 'string' && Email.test(val),
    default: '',
  },
  color: {
    test: (val: unknown) => typeof val === 'string' && Color.test(val),
    default: '#ffffff',
  },
  nonemp: {
    test: (val: unknown) => typeof val === 'string' && val !== '',
    default: '_',
  },
} as const;
