import * as React from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type NodeStatus = 'Active' | 'Queued' | 'Locked'

export type GridNode = {
  id: string
  title: string
  tokens: string
  status: NodeStatus
  tier: string
}

interface ContextGridProps {
  nodes: GridNode[]
  onReorder?: (nodes: GridNode[]) => void
}

const statusVariant: Record<NodeStatus, 'success' | 'info' | 'warning'> = {
  Active: 'success',
  Queued: 'info',
  Locked: 'warning',
}

function SortableCard({ node }: { node: GridNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={cn(
          'h-full cursor-grab border-border/60 bg-card/80 shadow-sm transition hover:border-primary/40 hover:shadow-md',
          isDragging && 'cursor-grabbing border-primary/60 shadow-lg'
        )}
      >
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base">{node.title}</CardTitle>
            <Badge variant={statusVariant[node.status]}>
              {node.status}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">{node.tokens}</div>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Tier: {node.tier}</span>
          <span>Drag to reprioritize</span>
        </CardContent>
      </Card>
    </div>
  )
}

export function ContextGrid({ nodes, onReorder }: ContextGridProps) {
  const [orderedNodes, setOrderedNodes] = React.useState(nodes)

  React.useEffect(() => {
    setOrderedNodes(nodes)
  }, [nodes])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Context Grid</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag cards to reprioritize which context slices get loaded first.
        </p>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event
            if (!over || active.id === over.id) {
              return
            }
            setOrderedNodes((items) => {
              const oldIndex = items.findIndex((item) => item.id === active.id)
              const newIndex = items.findIndex((item) => item.id === over.id)
              const nextNodes = arrayMove(items, oldIndex, newIndex)
              onReorder?.(nextNodes)
              return nextNodes
            })
          }}
        >
          <SortableContext
            items={orderedNodes.map((node) => node.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {orderedNodes.map((node) => (
                <SortableCard key={node.id} node={node} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  )
}
