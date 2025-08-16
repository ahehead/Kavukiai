import { type ClassicScheme, Presets } from 'rete-react-plugin'
import styled from 'styled-components'

const { Connection } = Presets.classic

const StyledConnection = styled(Connection)`
  /* 子 path のデフォルト stroke を確実に上書き */
  & path {
    stroke: #eb8525 !important; /* specificity + !important で確実に */
  }
`

export function CustomConnection(props: { data: ClassicScheme['Connection'] & { isLoop?: boolean } }) {
  return <StyledConnection {...props} />
}
