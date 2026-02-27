import { CopyRightProps } from '@/typings';
import { Typography } from '../Typography';

export function CopyRight(props: CopyRightProps) {
  return (
    <Typography {...props} as='span' color='neutral'>
      © {new Date().getFullYear()} projeKt Rage
    </Typography>
  );
}
