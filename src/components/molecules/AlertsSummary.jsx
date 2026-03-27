// src/components/atoms/AlertsSummary.jsx
import { AlertTriangle } from 'lucide-react';
import { Badge } from '../atoms/Badge';
import { Icon } from '../atoms/Icon';
import { Text } from '../atoms/Text';

export function AlertsSummary({ agotados, bajos }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      {/* Agotados */}
      <Badge variant="red" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon><AlertTriangle size={12} /></Icon>
        <Text weight={700}>{agotados} Agotados</Text>
      </Badge>

      {/* Stock bajo */}
      <Badge variant="yellow" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Text weight={700}>{bajos} Stock bajo</Text>
      </Badge>
    </div>
  );
}