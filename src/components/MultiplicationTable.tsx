const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1)

type Props = {
  labelledBy: string
}

// Full 10×10 table computed on render; always left to right, in both languages.
export function MultiplicationTable({ labelledBy }: Props) {
  return (
    <table className="times-table" dir="ltr" aria-labelledby={labelledBy}>
      <thead>
        <tr>
          <th scope="col" className="times-table__corner">
            ×
          </th>
          {NUMBERS.map((col) => (
            <th key={col} scope="col">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {NUMBERS.map((row) => (
          <tr key={row}>
            <th scope="row">{row}</th>
            {NUMBERS.map((col) => (
              <td key={col}>{row * col}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
