import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Text, toast, Prompt } from "@medusajs/ui"
import { useState } from "react"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"

const PriceHistoryWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPriceHistory = async () => {
    if (!data?.id) return
	
    setIsLoading(true)

    try {
      const response = await fetch(
        `/admin/products/${data.id}/price-history`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const result = await response.json()

      if (result.success) {
        toast.success(
          `Successfully deleted ${result.deleted_count} price history records`
        )
      } else {
        toast.error(result.message || "Failed to delete price history")
      }
    } catch (error) {
      console.error("Error deleting price history:", error)
      toast.error("An error occurred while deleting price history")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Omnibus Price History</Heading>
          <Text className="text-ui-fg-subtle text-small">
            Manage price history for EU Omnibus Directive compliance
          </Text>
        </div>
		<Prompt>
			<Prompt.Trigger asChild>
				<Button
				variant="danger"
				size="small"
				isLoading={isLoading}
				disabled={isLoading}
				>
				Reset Price History
				</Button>
			</Prompt.Trigger>

			<Prompt.Content>
				<Prompt.Header>
					<Prompt.Title>Delete something</Prompt.Title>
					<Prompt.Description>
						Are you sure you want to delete all price history for this product? <br/>
						This will remove the lowest price information displayed on the storefront (Omnibus Directive). <br/>
						This action cannot be undone.
					</Prompt.Description>
				</Prompt.Header>
				<Prompt.Footer>
					<Prompt.Cancel>Cancel</Prompt.Cancel>
					<Prompt.Action onClick={handleResetPriceHistory}>Delete</Prompt.Action>
				</Prompt.Footer>
			</Prompt.Content>
		</Prompt>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default PriceHistoryWidget
